# PostgreSQL -- DEV
Dans un premier temps, il faut installer postgresql, changer votre mot de passe d'utilisateur root postgres:
```
sudo apt install postgresql
sudo -u postgres psql
\password
\q
```

Créez un utilisateur testmybarbe, une db testmybarbedb, une db devmybarbe:
```
sudo -u postgres createuser testmybarbe;
sudo -u postgres psql
```
puis
```
ALTER USER testmybarbe WITH PASSWORD 'password';
CREATE DATABASE testmybarbedb;
\connect testmybarbedb
DROP SCHEMA PUBLIC CASCADE;
CREATE SCHEMA IF NOT EXISTS my_scheme AUTHORIZATION testmybarbe;
ALTER DATABASE testmybarbedb SET search_path TO my_scheme;
CREATE DATABASE devmybarbedb;
\connect devmybarbedb
DROP SCHEMA PUBLIC CASCADE;
CREATE SCHEMA IF NOT EXISTS my_scheme AUTHORIZATION testmybarbe;
ALTER DATABASE devmybarbedb SET search_path TO my_scheme;
\q
```

Voilà !