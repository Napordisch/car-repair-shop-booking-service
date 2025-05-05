#/bin/sh

mkdir certs
openssl req -nodes -new -x509 -keyout certs/key.pem -out certs/cert.pem