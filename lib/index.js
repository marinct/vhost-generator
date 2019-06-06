const fs = require("fs");
const exec = require("child_process").exec;
const readline = require("readline-sync");
const chalk = require("chalk");

function removeVH(options) {
  const { domain, ssl } = options;

  if (
    fs.existsSync(
      `/etc/apache2/sites-available/${domain}${ssl ? "-ssl" : ""}.conf`
    )
  ) {
    deactivateVH(`${domain}${ssl ? "-ssl" : ""}.conf`).then(child => {
      let removed = "not removed, try again.";
      let status = false;
      if (child.error) {
        removed = `error while deactivating ${domain}${ssl ? "-ssl" : ""}.conf`;
      }
      child.stdout.on("data", data => {
        if (
          data.indexOf(`Site ${domain}${ssl ? "-ssl" : ""} disabled`) != -1 ||
          data.indexOf(`Site ${domain}${ssl ? "-ssl" : ""} already disabled`) !=
            -1
        ) {
          console.log(chalk.yellow.italic("Removing virtual host..."));
          removed = true;
          reloadService().then(() => {
            status = fs.unlinkSync(
              `/etc/apache2/sites-available/${domain}${ssl ? "-ssl" : ""}.conf`
            );
            removeHosts(`${domain}${ssl ? "-ssl" : ""}`);
            removePort(`${domain}${ssl ? "-ssl" : ""}`);
          });
        }
      });
      child.stderr.on("data", data => {
        if (data.indexOf("Permission denied") != -1) {
          console.log(
            chalk.red(`Script needs to be run with ${chalk.red.bold("sudo")}.`)
          );
          process.exit(0);
        }
        removed = `error while deactivating ${domain}${ssl ? "-ssl" : ""}.conf`;
      });
      child.on("exit", code => {
        if (removed == true) {
          console.log(
            "Status:",
            status == undefined
              ? chalk.green.bold("removed.")
              : chalk.red.bold("couldn't remove file from sites-available.")
          );
        } else {
          console.log(`Status: ${removed}`);
        }
      });
    });
  } else {
    return console.log(
      chalk.red.bold("No virtual host with that domain exists.")
    );
  }
}

function createVH(options) {
  const { domain, path, ssl, port, ip, public, template } = options;
  _port = ssl && port == "80" ? "443" : port;
  if (
    fs.existsSync(
      `/etc/apache2/sites-available/${domain}${ssl ? "-ssl" : ""}.conf`
    )
  ) {
    alreadyExists();
  }
  var content = loadTemplate(template, ssl, {
    ip,
    port: _port,
    domain,
    path,
    public
  });
  fs.writeFile(
    `/etc/apache2/sites-available/${domain}${ssl ? "-ssl" : ""}.conf`,
    content,
    function(err) {
      if (err) {
        switch (err.code) {
          case "EACCES":
            console.log(
              chalk.red(
                `Script needs to be run with ${chalk.red.bold("sudo")}.`
              )
            );
            process.exit(0);
            break;
          default:
            console.log(err);
        }
        return false;
      }
      fs.createReadStream("/etc/hosts").pipe(
        fs.createWriteStream(
          __dirname + `/backup/${new Date().getTime()}_hosts`
        )
      );

      fs.createReadStream("/etc/apache2/ports.conf").pipe(
        fs.createWriteStream(
          __dirname + `/backup/${new Date().getTime()}_ports.conf`
        )
      );
      let log = `${chalk.green("VirtualHost created")}\nDomain: ${chalk.bold(
        `${ssl ? "https" : "http"}://${domain}`
      )}\nPath: ${chalk.bold(
        `${`/etc/apache2/sites-available/${domain}${ssl ? "-ssl" : ""}.conf`}`
      )}\n`;
      activateVH(`${domain}${ssl ? "-ssl" : ""}.conf`).then(child => {
        let activated = false;
        if (child.error) {
          activated = `error, try manual activation, sudo a2ensite ${domain}${
            ssl ? "-ssl" : ""
          }.conf`;
        }
        child.stdout.on("data", data => {
          if (data.indexOf("To activate the new configuration") != -1) {
            activated = true;
          } else if (data.indexOf("already enabled") != -1) {
            activated = "already enabled";
          }
        });
        child.stderr.on("data", data => {
          console.log(data);

          activated = `error, try manual activation, sudo a2ensite ${domain}${
            ssl ? "-ssl" : ""
          }.conf`;
        });
        child.on("exit", code => {
          if (activated == true) {
            fs.appendFileSync(
              "/etc/hosts",
              `\n# ${domain}${ssl ? "-ssl" : ""}\n127.0.0.1  ${domain}`
            );

            if (parseInt(_port) != 80 && parseInt(_port) != 443) {
              fs.appendFileSync(
                "/etc/apache2/ports.conf",
                `\n# ${domain}${ssl ? "-ssl" : ""}\nListen ${_port}`
              );
            }

            reloadService().then(() => {
              console.log("Ready to use!");
            });
          }
          console.log(`${log}Activated: ${chalk.bold(`${activated}`)}\n`);
        });
      });
    }
  );
}

function alreadyExists() {
  console.log(
    chalk.red.bold(`A virtual host with that domain already exists.\n`)
  );
  let answer = readline.question("Do you want to override it? y/n\n");
  if (answer != "y" || answer == "n") {
    console.log("Aborted.");
    process.exit(0);
  } else {
    console.log("Overriding current virtual host...");
  }
}

function loadTemplate(template, ssl, data) {
  template = require(`./templates/${template}${ssl ? "-ssl" : ""}.js`);
  return template.fill(data);
}

function removeHosts(domain) {
  fs.readFile("/etc/hosts", "utf8", function read(err, data) {
    var data_array = data.split("\n");
    if (err) {
      throw err;
    }

    line = -1;
    for (var i = data_array.length - 1; i > -1; i--) {
      if (data_array[i].match(domain)) {
        line = i;
      }
    }
    if (line > 0) data_array.splice(line, 2);
    fs.writeFile("/etc/hosts", data_array.join("\n"), err => {
      if (err) {
        console.log(
          "Couldn't remove domain from /etc/hosts. Remove it manually!"
        );
      }
    });
  });
}

function removePort(domain) {
  fs.readFile("/etc/apache2/ports.conf", "utf8", function read(err, data) {
    var data_array = data.split("\n");
    if (err) {
      throw err;
    }

    line = -1;
    for (var i = data_array.length - 1; i > -1; i--) {
      if (data_array[i].match(domain)) {
        line = i;
      }
    }
    if (line > 0) data_array.splice(line, 2);
    fs.writeFile("/etc/apache2/ports.conf", data_array.join("\n"), err => {
      if (err) {
        console.log(
          "Couldn't remove port for that domain, from /etc/apache2/ports.conf. Remove it manually!"
        );
      }
    });
  });
}

async function activateVH(domain) {
  return await exec(`a2ensite ${domain}`);
}
async function deactivateVH(domain) {
  return await exec(`a2dissite ${domain}`);
}
async function reloadService() {
  return await exec(`service apache2 restart`);
}

exports.create = createVH;
exports.remove = removeVH;
