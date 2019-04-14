exports.fill = ({ip, port, domain, path, public}) => `
<IfModule mod_ssl.c>
    <VirtualHost _default_:443>
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

		SSLEngine on

		SSLCertificateFile	/etc/ssl/certs/ssl-cert-snakeoil.pem
		SSLCertificateKeyFile /etc/ssl/private/ssl-cert-snakeoil.key

		<FilesMatch "\.(cgi|shtml|phtml|php)$">
				SSLOptions +StdEnvVars
		</FilesMatch>
		<Directory /usr/lib/cgi-bin>
				SSLOptions +StdEnvVars
		</Directory>

	</VirtualHost>
</IfModule>

# vim: syntax=apache ts=4 sw=4 sts=4 sr noet
`