exports.fill = ({ip, port, domain, path, public}) => `
<VirtualHost ${ip}:${port}>
  ServerName ${domain}
  
  ServerAdmin webmaster@localhost
  DocumentRoot ${path}${public ? `/${public}` : ""}
  <Directory ${path}${public ? `/${public}` : ""}>
    Options Indexes FollowSymLinks MultiViews
    AllowOverride All
    Require all granted
  </Directory>

  ErrorLog \${APACHE_LOG_DIR}/${domain}_error.log
  CustomLog \${APACHE_LOG_DIR}/${domain}_access.log combined

</VirtualHost>

# vim: syntax=apache ts=4 sw=4 sts=4 sr noet
`;
