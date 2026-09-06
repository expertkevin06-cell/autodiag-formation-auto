# 🔧 AutoDiag Pro - Application de Diagnostic Automobile

Application web progressive (PWA) complète pour la formation et le diagnostic automobile, convertible en APK Android via PWABuilder.

## ✨ Fonctionnalités

### 🎯 Diagnostic complet
- **Filtres avancés** : Marque, modèle, motorisation, type de panne, composant, code OBD
- **Base de données riche** : Pannes mécaniques, électriques, électroniques
- **Détails complets** : Symptômes, causes, conséquences, diagnostics, réparations
- **Toutes marques** : Françaises, européennes, asiatiques, chinoises, américaines
- **Toutes motorisations** : Essence, FlexFuel, Diesel, Hybride, Électrique

### 📱 Fonctionnement hors ligne
- **Service Worker** : Fonctionne sans connexion internet
- **IndexedDB** : Base de données locale
- **Compatible 4G/5G/WiFi** : Synchronisation automatique

### 👥 Gestion des utilisateurs
- **Mode administrateur** : Contrôle total de l'application
- **Système d'accès** : Acceptation, refus, révocation des utilisateurs
- **Authentification sécurisée** : Mots de passe hashés
- **Sessions persistantes** : Connexion automatique

### 💾 Sauvegarde et partage
- **Export/Import** : Sauvegarde complète des données
- **Partage** : Génération de liens de partage
- **Conversion APK** : Instructions pour PWABuilder

## 🚀 Installation

### Option 1 : Utilisation locale (développement)

1. **Cloner ou télécharger le projet**
   ```bash
   git clone <votre-repo>
   cd autodiag-pro
   ```

2. **Lancer un serveur local** (HTTPS requis pour PWA)
   ```bash
   # Avec Python 3
   python -m http.server 8000
   
   # Avec Node.js (http-server)
   npx http-server -p 8000
   
   # Avec PHP
   php -S localhost:8000
   ```

3. **Accéder à l'application**
   ```
   http://localhost:8000
   ```

### Option 2 : Hébergement en ligne (recommandé)

#### GitHub Pages (gratuit)
1. Créez un repository GitHub
2. Uploadez tous les fichiers
3. Activez GitHub Pages dans les paramètres
4. L'application sera accessible en HTTPS

#### Netlify (gratuit)
1. Créez un compte sur netlify.com
2. Glissez-déposez le dossier du projet
3. L'application est automatiquement déployée en HTTPS

#### Vercel (gratuit)
1. Créez un compte sur vercel.com
2. Importez le projet depuis GitHub
3. Déploiement automatique en HTTPS

### Option 3 : Conversion en APK Android

1. **Hébergez l'application** (voir Option 2)
2. **Allez sur PWABuilder** : https://www.pwabuilder.com
3. **Entrez l'URL** de votre site hébergé
4. **Cliquez sur "Package for stores"**
5. **Sélectionnez "Android"**
6. **Téléchargez le fichier APK** généré
7. **Installez-le** sur votre appareil Android

## 🔐 Comptes par défaut

### Administrateur
- **Identifiant** : `admin`
- **Mot de passe** : `Kevin83600`

⚠️ **IMPORTANT** : Changez ce mot de passe immédiatement après la première connexion pour des raisons de sécurité !

## 📖 Utilisation

### Connexion
1. Entrez vos identifiants
2. Cliquez sur "Se connecter"
3. L'application est accessible

### Recherche de pannes
1. Utilisez les filtres pour affiner votre recherche
2. Cliquez sur une panne pour voir les détails
3. Consultez symptômes, causes, conséquences, diagnostics et réparations

### Mode administrateur
1. Connectez-vous avec un compte admin
2. Cliquez sur l'icône ⚙️ en haut à droite
3. Gérez les utilisateurs, les données, et le partage

### Sauvegarde
1. Cliquez sur l'icône 💾 en haut à droite
2. Choisissez "Exporter les données"
3. Le fichier JSON est téléchargé

### Partage
1. Mode admin → Onglet "Partage"
2. Copiez le lien généré
3. Partagez-le avec d'autres utilisateurs

## 🛠️ Personnalisation

### Ajouter des pannes
1. Mode admin → Onglet "Gestion des données"
2. Importez un fichier JSON de pannes
3. Format attendu : voir `js/data.js`

### Modifier les marques/modèles
1. Éditez le fichier `js/data.js`
2. Modifiez l'objet `AUTO_DATA.brands`
3. Rechargez l'application

### Changer les couleurs
1. Éditez le fichier `css/styles.css`
2. Modifiez les variables CSS dans `:root`

## 📊 Structure de la base de données

### Pannes (faults)
```json
{
  "id": "F001",
  "code": "P0010",
  "title": "Distribution - Position arbre à cames",
  "type": "mecanique",
  "component": "Chaîne de distribution",
  "brands": ["ALL"],
  "engines": ["essence", "diesel"],
  "symptoms": ["Voyant moteur allumé", "..."],
  "causes": ["Chaîne détendue", "..."],
  "consequences": ["Dommages soupapes", "..."],
  "diagnostics": ["Vérifier tension", "..."],
  "repairs": ["Remplacement chaîne", "..."],
  "severity": "critique",
  "cost": "800-2500€"
}
```

### Utilisateurs (users)
```json
{
  "username": "admin",
  "password": "hash_sha256",
  "role": "admin",
  "status": "approved",
  "createdAt": 1234567890,
  "lastLogin": 1234567890
}
```

## 🔒 Sécurité

- Mots de passe hashés avec SHA-256
- Sessions stockées en sessionStorage
- Contrôle d'accès par rôle
- Validation des entrées utilisateur

⚠️ **Pour une utilisation en production** :
- Utilisez une vraie bibliothèque crypto (bcrypt, argon2)
- Implémentez un backend pour la gestion des utilisateurs
- Ajoutez une authentification à deux facteurs
- Mettez en place des sauvegardes automatiques

## 📱 Compatibilité

- ✅ Chrome/Edge (desktop et mobile)
- ✅ Firefox (desktop et mobile)
- ✅ Safari (desktop et mobile)
- ✅ Android (via APK ou navigateur)
- ✅ iOS (via Safari)

## 🐛 Dépannage

### L'application ne se charge pas
- Vérifiez que vous utilisez HTTPS
- Vérifiez la console du navigateur (F12)
- Videz le cache du navigateur

### Le Service Worker ne s'installe pas
- Vérifiez que vous êtes en HTTPS
- Vérifiez le fichier `sw.js`
- Consultez la console du navigateur

### Les données ne se sauvegardent pas
- Vérifiez que IndexedDB est activé
- Consultez la console du navigateur
- Vérifiez l'espace de stockage disponible

## 📝 Licence

Ce projet est fourni tel quel pour usage éducatif et professionnel.

## 🤝 Contribution

Pour ajouter des pannes ou améliorer l'application :
1. Modifiez les fichiers nécessaires
2. Testez localement
3. Soumettez vos modifications

## 📞 Support

Pour toute question ou problème, consultez la documentation ou contactez l'administrateur de l'application.

---

**AutoDiag Pro v1.0** - Formation & Diagnostic Automobile
Compatible 4G / 5G / WiFi / Hors ligne
Connexion admin : `admin` / `Kevin83600`
