# PostgreSQL -- DEV
Dans un premier temps, il faut installer postgresql, changer votre mot de passe d'utilisateur root postgres:
```
sudo apt install postgresql
sudo -u postgres psql
\password
\q
```

Créez un utilisateur testmybarbe, une db testmybarbedb:
```
sudo -u postgres createuser testmybarbe;
sudo -u postgres psql
```
puis
```
CREATE DATABASE testmybarbedb;
\connect testmybarbedb
DROP SCHEMA PUBLIC CASCADE;
CREATE SCHEMA IF NOT EXISTS my_scheme AUTHORIZATION testmybarbe;
ALTER USER testmybarbe WITH PASSWORD 'password';
ALTER ROLE testmybarbe SET search_path TO my_scheme;
\q
```

Voilà !