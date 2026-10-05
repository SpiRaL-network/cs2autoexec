# CS2 Profile Studio

**Vos réglages. Partout.** Capturez votre configuration actuelle de Counter-Strike 2, modifiez-la dans des catégories familières et conservez un profil réutilisable, un autoexec et une configuration vidéo.

[English](README.md) · **Français** · [Télécharger l’application Windows](https://github.com/SpiRaL-network/cs2autoexec/releases/latest) · [Historique](CHANGELOG.md)

![CS2 Profile Studio : éditeur local de réglages](docs/studio-preview.png)

## Démarrer

1. Téléchargez `CS2-Profile-Studio-3.1.0-windows-x64.zip`, extrayez **tout le dossier**, puis lancez `CS2 Profile Studio.exe`. Windows 10/11, x64 ; aucune installation de Node.js nécessaire.
2. Faites vos réglages dans CS2, puis **fermez le jeu** pour qu’ils soient enregistrés.
3. Choisissez le compte Steam et l’installation, puis **Capturer les réglages**. Si la détection échoue, sélectionnez le dossier Steam ou importez les sources manuellement.
4. Dans **Modifier les réglages**, parcourez **Vidéo, Audio, Jeu, Clavier / souris, Viseur et lunettes**, ainsi que **Données avancées**. Sauvegardez un `.cs2profile`, puis passez à **Exporter ou installer**.

L’application fonctionne localement, sans connexion à un compte, télémétrie, stockage distant ni mises à jour automatiques. L’exécutable n’est pas signé. Aucun droit administrateur n’est nécessaire si vos dossiers Steam sont accessibles en écriture.

## Capturer et modifier

Les sources se trouvent dans `Steam/userdata/<compte>/730/local/cfg` :

| Source | Contenu |
| :--- | :--- |
| `cs2_user_convars_*_slot*.vcfg` | Préférences joueur, HUD, radar, viseur et autres options. |
| `cs2_user_keys_*_slot*.vcfg` | Touches clavier/souris et axes analogiques enregistrés. |
| `cs2_machine_convars.vcfg` | Préférences console de la machine, dont audio et limites d’IPS. |
| `cs2_video.txt` | Affichage, résolution, fréquence et qualité graphique. |

Chaque source est conservée intégralement, y compris les données inconnues ou imbriquées. Les noms comme `hud_scaling$3` et les réglages musicaux en `$4` restent intacts dans les VCFG ; l’autoexec utilise le véritable nom de commande. Choisissez l’emplacement joueur à exporter. Les autres restent dans la sauvegarde complète.

L’autoexec du dossier du jeu est conservé sous `original-autoexec.cfg`. Ses définitions d’alias sur une ligne sont incluses dans l’autoexec généré. Ses autres commandes et dépendances `exec` restent à vérifier séparément. Le profil sauvegarde les réglages, pas l’ensemble du compte Steam, l’inventaire, les cartes, les options de lancement, le pilote graphique ou tous les fichiers du jeu.

Recherchez un nom/une commande, filtrez par catégorie/section ou par modifications. Modifiez les valeurs et listes de choix disponibles, réattribuez les touches avec leurs noms CS2 ou scancodes. Les doublons et les valeurs numériques invalides bloquent l’export. Consultez source, valeur brute et valeur capturée ; annulez une modification ou toutes. Sources originales et modifications sont séparées, avec empreintes de contrôle.

Les unités moteur sont conservées. Les réglages audio marqués **Gain sauvegardé · unités moteur** utilisent le gain non linéaire sauvegardé ; aucune conversion approximative en pourcentage du menu n’est appliquée. Valeurs vidéo non prises en charge et identifiants matériels restent visibles. Activez **Détails techniques** pour examiner les commandes, sources et valeurs capturées. **Options du profil** regroupe le nom et le choix d’emplacement joueur.

## Exporter

Le pack contient :

- `autoexec.cfg` : commandes joueur reconnues et archivées adaptées au transfert, sans preset imposé ni raccourci d’entraînement ajouté.
- `cs2_video.txt`, s’il a été capturé : vidéo modifiée complète, avec données d’affichage/matérielles.
- `profile.cs2profile` : profil réouvrable, modifiable et réinstallable.
- `raw-source/` et `edited-source/` : sources intégrales originales et modifiées.
- `manifest.json` : empreintes et rapport d’exclusion, accompagné des instructions.

Les données de développement, protégées, répliquées, propres au compte/périphérique ou non représentables dans un CFG restent dans les sources complètes. Elles ne sont pas supprimées du profil.

Pour charger l’autoexec manuellement, placez-le dans `game/csgo/cfg`, activez la console et lancez `exec autoexec.cfg`. Ajoutez `+exec autoexec.cfg` aux options Steam pour demander son chargement au démarrage. Un autoexec réapplique les réglages à son exécution ; il **ne verrouille pas** les menus.

## Installer et restaurer

Ouvrez **Exporter ou installer**, sélectionnez le compte et l’installation **de destination**, puis **Installer…** :

| Mode | Comportement |
| :--- | :--- |
| Réglages portables | Installe l’autoexec et fusionne les préférences graphiques reconnues dans la vidéo cible. Conserve GPU, réglages matériels, écran, résolution et fréquence de destination. Une option transfère aussi l’affichage. Lancez CS2 une première fois sur un nouveau compte pour créer son fichier vidéo. |
| Sources complètes | Installe tous les VCFG/vidéo capturés et modifiés, plus l’autoexec. Prévu pour la même machine ; inclut les préférences propres au compte et au matériel. |

Les deux modes affichent les fichiers cibles, sauvegardent l’existant et s’arrêtent si un fichier a changé depuis l’aperçu. **Annuler la dernière installation** restaure la dernière sauvegarde, y compris en supprimant les fichiers créés par cette installation. L’opération s’arrête si les fichiers installés ont changé ensuite. Sauvegardes : `%APPDATA%/cs2-profile-studio/backups`.

Fermez CS2. Steam Cloud peut proposer une autre copie au lancement suivant : vérifiez les conflits. L’autoexec du dossier du jeu est partagé par les comptes utilisant cette installation. Le mode portable ne restaure pas toutes les préférences réservées aux sources ; gardez le profil complet pour les récupérer.

## Configurations serveur

L’espace **Serveurs & entraînement** génère des packs CFG distincts pour l’entraînement local, le surf, le bunnyhop et l’entraînement KZ vanilla. Noms et limites des commandes sont vérifiés dans le catalogue CS2 du **05/10/2026**. Les valeurs de gameplay sont des points de départ modifiables, pas un règlement communautaire ; elles ne sont pas testées en jeu.

L’export KZ contient aussi une configuration séparée issue de [CS2KZ](https://github.com/KZGlobalTeam/cs2kz-metamod/blob/master/cfg/cs2kz.cfg) et ses instructions. Un serveur KZ complet nécessite [le plugin CS2KZ](https://github.com/KZGlobalTeam/cs2kz-metamod), Metamod et les dépendances documentées. Laissez le plugin gérer son mode de mouvement ; ne combinez pas sa configuration avec le bac à sable KZ vanilla. Chronomètres et checkpoints surf/bhop nécessitent également cartes et plugins adaptés.

L’application génère les fichiers ; elle n’installe pas de plugins, n’héberge pas de serveur et ne configure pas le réseau. Chargez une carte adaptée sur votre serveur et exécutez le CFG selon les instructions du pack.

## Développement

Node.js **22.12+**, npm et Windows pour le test de bureau et la compilation :

```sh
npm ci
npm test
npm start
npm run test:ui
npm run dist
```

Les tests couvrent sources intégrales, suffixes, modifications, emplacements joueur, touches, fusion vidéo, export, installation avec sauvegarde et retour arrière. Le test Electron utilise des dossiers Steam/CS2 fictifs, sans modifier votre jeu réel. La CI vérifie le moteur sur Linux/Windows et l’interface sur Windows.

Métadonnées de menus/commandes : [GameTracking-CS2](https://github.com/SteamTracking/GameTracking-CS2/tree/master/game/csgo/pak01_dir/panorama/layout/settings). Aucun visuel du jeu ni XML original du menu n’est distribué. Actualisation : [tools/generate-catalog.py](tools/generate-catalog.py). Les mises à jour du jeu peuvent faire évoluer fichiers et commandes.


Projet indépendant de SpiRaL sous [licence MIT](LICENSE), sans affiliation avec Valve. Les notices des composants tiers sont incluses dans la distribution Windows.
