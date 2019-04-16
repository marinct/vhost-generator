# VHost Generator #


```
npm install -g vhost-generator
```

A virtual host file generator for Ubuntu machine with Apache2

Requires administrative rights*

Commands:
* --help        Help
* --create -c   Create new virtual host
* --remove -r   Remove a vhost by domain

Options:
* --domain -d   Domain**
* --path   -p   Path to project root, default: curent working directory
* --public      Public folder, ex: public_html, web, public, default: none
* --ip          The IP for vhost, default: *
* --port        The access port for vhost, default: 80
* --ssl         Secure vhost, default: false
* --template    Template of virtual host file, default: default
**required

Example:
sudo vhost -c -d example.com

## Templates
You can add your own virtual host template in templates folder under project_root/lib
For ssl templates add '-ssl' at the end of the filename

## Auto backup
When you create a new virtual host, a backup with your old settings for hosts and ports.conf are saved in project_root/lib/backup
