# PostgreSQL -- PRODUCTION
Dans un premier temps, il faut installer postgresql:
```
sudo apt install postgresql
```

Créez un utilisateur paymybarbe pour la DB (Vous pouvez utiliser un autre nom si vous voulez), puis connectez-vous à la base de donnée via postgres, l'utilisateur root de postgresql:
```
sudo -u postgres createuser paymybarbe -P;
sudo -u postgres psql
```

Ensuite:
```
\password -- change le mot de passe de l'utilisateur root de la base de donnée, postgres, par sécurité
CREATE DATABASE paymybarbedb; -- Créer une BDD pour le logiciel
\connect paymybarbedb
DROP SCHEMA PUBLIC CASCADE; -- Supprime et recréé le schéma par sécurité
CREATE SCHEMA IF NOT EXISTS my_scheme AUTHORIZATION paymybarbe;
ALTER ROLE paymybarbe SET search_path TO my_scheme;
\q
```

Il faut maintenant modifier la configuration de postgresql pour que la connexion fonctionne correctement:
Si votre version de postgresql est 12:
```
sudo sed -i -e "s/local.*all.*\(postgres\|all\).*peer/local   all             \1                                md5/g" /etc/postgresql/12/main/pg_hba.conf
sudo service postgresql restart
```

### (Optionnel) Créer un utilisateur read-only pour la DB
```
sudo -u postgres createuser paymybarbeRO -P
sudo -u postgres psql
```

Ajoutons maintenant les droits à l'utilisateur read-only:
```
GRANT CONNECT ON DATABASE paymybarbedb TO paymybarbeRO;
GRANT USAGE ON SCHEMA my_scheme TO paymybarbeRO;
ALTER DEFAULT PRIVILEGES IN SCHEMA my_scheme GRANT SELECT ON TABLES TO paymybarbeRO;
ALTER ROLE paymybarbeRO SET search_path TO my_scheme;
\q
```

### (Recommandé mais optionnel) Créer un utilisateur et une datatabase de test
Permet de lancer les tests et vérifier le bon fonctionnement du logiciel.
```
sudo -u postgres createuser testmybarbe;
sudo -u postgres psql
```

Puis:

```
ALTER USER testmybarbe WITH PASSWORD 'password';
CREATE DATABASE testmybarbedb;
\connect testmybarbedb
DROP SCHEMA PUBLIC CASCADE;
CREATE SCHEMA IF NOT EXISTS my_scheme AUTHORIZATION testmybarbe;
ALTER DATABASE testmybarbedb SET search_path TO my_scheme;
\q
```



Voilà !

## 