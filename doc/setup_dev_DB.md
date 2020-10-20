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

Il faut maintenant modifier la configuration de postgresql pour que la connexion fonctionne correctement:
Si votre version de postgresql est 12:
```
sudo sed -e "s/local.*all.*postgres.*peer/local   all             postgres                                md5/g" /etc/postgresql/12/main/pg_hba.conf 
sudo service postgresql restart
```

Voilà !