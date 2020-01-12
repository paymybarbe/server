# PostgreSQL -- PRODUCTION
Dans un premier temps, il faut installer postgresql:
```
sudo apt install postgresql
```

Créez un utilisateur paymybarbe pour la DB (Vous pouvez utiliser un autre nom si vous voulez):
```
sudo -u postgres createuser paymybarbe -P
```

(Optionnel) Créez un utilisateur read-only pour la DB (Vous pouvez utiliser un autre nom si vous voulez, mais mettez bien un mot de passe):
```
sudo -u postgres createuser paymybarbeRO -P
```

Connectez-vous à la base de donnée via postgres, l'utilisateur root de postgresql:
```
sudo -u postgres psql
```

Changez ensuite le mot de passe de l'utilisateur root de la base de donnée, postgres, par sécurité:
```
\password
```

Créez une BDD pour le logiciel (Vous pouvez utiliser un autre nom si vous voulez):
```
CREATE DATABASE paymybarbedb;
```

Supprimez le schéma PUBLIC pour éviter les erreurs:
```
\connect paymybarbedb
DROP SCHEMA PUBLIC CASCADE;
```

Créez un schéma ayant pour propriétaire votre utilisateur précédent (Vous pouvez utiliser un autre nom si vous voulez):
```
CREATE SCHEMA IF NOT EXISTS my_scheme AUTHORIZATION paymybarbe;
ALTER ROLE paymybarbe SET search_path TO my_scheme;
```

Ajoutons maintenant les droits à l'utilisateur read-only:
```
GRANT CONNECT ON DATABASE paymybarbedb TO paymybarbeRO;
GRANT USAGE ON SCHEMA my_scheme TO paymybarbeRO;
ALTER DEFAULT PRIVILEGES IN SCHEMA my_scheme GRANT SELECT ON TABLES TO paymybarbeRO;
ALTER ROLE paymybarbeRO SET search_path TO my_scheme;
```

Vous pouvez quitter en faisant:
```
\q
```

Voilà !

## 