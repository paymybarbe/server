# payMyBarbe - Server

## Installation
- [Installez PostgreSQL](doc/setup_dev_DB.md)
- Clonez le repo dans un dossier vide.
- Installez les dépendances:
```
npm install
```

## Utilisation
Pour programmer, après avoir clone le repos:


Pour lancer le server:
```
npm start
```

Pour les tests:
```
npm run test
```

# TODO:

# IMPORTANT:

- NE PAS UPLOAD LES MOTS DE PASSE UTILISÉS EN PRODUCTION (en utilisation réelle.)
- NE PAS UPLOAD LES KEYS DES CERTIFICATS, c'est à dire les fichiers ```./certs/*-key.pem```. Les ```./certs/*-csr.pem``` ne sont pas utiles mais pas critiques.

# À respecter:

## Architecture


## Tests
- METTRE DES TESTS

## Divers
- Pour accéder à un fichier situé dans le dossier contenant ce fichier README, utiliser ```path.resolve(process.env.APP_RESOURCES, "path/to/file")```.  
Cela évitera les problèmes lors du build.  
Pour accéder à des fichiers en dehors de ce dossier (et qui ne seront pas incluts dans le build), remplacer ```process.env.APP_RESOURCES``` par ```process.env.BIN_FOLDER```

# Principes
Le serveur est le seul à avoir accès à la database. Tout action sur le client envoie une info au serveur sur l'action.  
Le serveur renvoit ensuite les infos nécessaires, ainsi que les changements ayant été fait dernièrement.  
(Si on enlève un menu depuis le serveur, le client ne le sera pas tant qu'une nouvelle action n'aura pas été effectuée sur le client.)  

Les demandes et réponses sont des objets JSON contenant:  
    - Les informations nécessaire à l'action (que ce soit en demande ou en réponse)  
    - l'événement à déclencher pour traiter ces informations.  

Exemple: si on demande au serveur de commander un bounty, on peut envoyer une requête: 
```JSON
{
    event-to-call: "update-current-command"
    data: {
        client: idclient
        command: [
            {
                product: idproduct1
                number: number_of_products
            }
            {
                product: idproduct2
                number: number_of_products
            }
        ]
    }
}
```

Le serveur lance l'événement update-current-command, qui vérifie si les changements sont possibles, puis les écrits dans la database, et enfin renvoit le même objet avec les quantité de produits possible: on augmente pas la valeur si on est au dessus du stock.
On peut renvoyer une command nulle pour abort, par exemple.

# Features Road

[Voir la doc](https://gitlab.telecomnancy.univ-lorraine.fr/Frantz.Darbon/my-awesome-nomtemporaire)


# Idées:

...

# Modules utiles:
| Module   | Utilité                                    |
| ------   | ------                                     |
| Mocha    | Tests                                      |
| Chai     | Tests                                      | 
| Bunyan   | Logs                                       | 
| Debug    | Debugging dans la console                  | 
| Chokidar | Vérification des modifications de fichiers | 

# Ressources utiles:
- https://github.com/electron/electron-api-demos : Excellent exemple d'utilisation de electron, de communication entre fenêtres et de navigation.


# Pour la prod:
- Certificats pour la prod à faire
- paramètres à configurer dans les production.json
