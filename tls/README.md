Generated certificate (cert.pem) and private key (key.pemt) with command:

openssl req -new -x509 -nodes -days 365 -keyout key.pem -out cert.pem

When your server is up and running, you can check it with the command:

openssl s_client -connect 127.0.0.1:8000
