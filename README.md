# VeillePulse — Plateforme de Veille Stratégique & Baromètre d'Opinion

VeillePulse est une application moderne de veille stratégique automatisée inspirée de Ground News, intégrant analyse de spectre médiatique, catégorisation intelligente, alertes sonores et visuelles, synthèse par IA et envoi de rapports.

---

## 🚀 Comment mettre l'application en ligne avec GitHub ?

Vous avez **deux méthodes simples** selon vos besoins :

### Méthode 1 : Directement sur GitHub Pages (100% gratuit, hébergé par GitHub)
Cette méthode permet de rendre l'interface en ligne accessible publiquement via une adresse `https://votre-pseudo.github.io/votre-depot/`.

1. **Créer un dépôt sur GitHub** :
   - Rendez-vous sur [github.com/new](https://github.com/new).
   - Nommez votre dépôt (ex: `veillepulse`).
   - Laissez-le en public (ou privé).
2. **Envoyer le code sur GitHub** :
   - Si vous utilisez Git en local :
     ```bash
     git init
     git add .
     git commit -m "Initial commit VeillePulse"
     git branch -M main
     git remote add origin https://github.com/<VOTRE-PSEUDO>/<VOTRE-DEPOT>.git
     git push -u origin main
     ```
   - Ou si vous téléchargez le ZIP depuis AI Studio : Dézippez et poussez les fichiers dans le dépôt.
3. **Activer GitHub Pages** :
   - Sur votre dépôt GitHub, allez dans **Settings** > **Pages** (dans le menu de gauche).
   - Sous **Build and deployment > Source**, choisissez **GitHub Actions**.
   - Grâce au fichier déjà inclus `.github/workflows/deploy.yml`, le déploiement se fait automatiquement en 1 à 2 minutes dès que vous poussez sur `main` !
   - L'URL de votre site apparaîtra en haut de la page Settings > Pages.

---

### Méthode 2 : Déploiement Fullstack en 1 clic (Vercel ou Render) — *Recommandé*
L'application contient à la fois le client React et un serveur Node.js/Express (`server.ts`) qui permet d'effectuer les scans en direct et d'exécuter Gemini API.
Pour que le backend fonctionne également en direct :

#### Avec Vercel :
1. Créez un compte gratuit sur [Vercel](https://vercel.com).
2. Cliquez sur **Add New...** > **Project**.
3. Importez votre dépôt GitHub.
4. Dans **Environment Variables**, ajoutez :
   - `GEMINI_API_KEY` : votre clé d'API Google Gemini (si vous souhaitez les scans IA en direct).
5. Cliquez sur **Deploy**. En moins d'une minute, votre application est en ligne avec son adresse `https://veillepulse.vercel.app`.

#### Avec Render :
1. Créez un compte sur [Render](https://render.com).
2. Cliquez sur **New +** > **Web Service**.
3. Liez votre dépôt GitHub.
4. Spécifiez :
   - Build Command : `npm install && npm run build`
   - Start Command : `npm start`
5. Ajoutez la variable `GEMINI_API_KEY` dans les réglages d'environnement.
6. Cliquez sur **Create Web Service**.

---

## 🛠️ Lancer le projet en local

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

3. Compiler pour la production :
   ```bash
   npm run build
   ```
