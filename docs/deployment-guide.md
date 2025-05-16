# Guide de Déploiement

Ce document détaille les étapes nécessaires pour déployer l'application GoofyTrack dans différents environnements.

## Prérequis

- Compte GitHub
- Compte Vercel
- Compte Neon Tech (pour la base de données PostgreSQL)
- Node.js v18 ou supérieur
- Docker et Docker Compose (pour le développement local)

## Environnements de Déploiement

GoofyTrack utilise trois environnements de déploiement :

1. **Développement** : Environnement local pour le développement
2. **Staging** : Environnement de préproduction pour les tests
3. **Production** : Environnement de production pour les utilisateurs finaux

## Configuration des Variables d'Environnement

### Variables Requises

```
# Base de données
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"

# Providers d'authentification (optionnel)
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
GOOGLE_ID="your-google-client-id"
GOOGLE_SECRET="your-google-client-secret"

# Email (optionnel)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="user@example.com"
EMAIL_SERVER_PASSWORD="password"
EMAIL_FROM="noreply@example.com"
```

## Déploiement Local (Développement)

### 1. Cloner le Dépôt

```bash
git clone https://github.com/GoofyTeam/GoofyTrack.git
cd GoofyTrack
```

### 2. Configurer les Variables d'Environnement

```bash
cp .env.dist .env
# Modifier les variables dans .env selon vos besoins
```

### 3. Démarrer les Services Docker

```bash
docker-compose up -d
```

### 4. Installer les Dépendances

```bash
npm install
# ou
yarn install
```

### 5. Exécuter les Migrations

```bash
npx prisma migrate dev
```

### 6. Seed la Base de Données

```bash
npx prisma db seed
```

### 7. Démarrer l'Application

```bash
npm run dev
# ou
yarn dev
```

L'application sera disponible à l'adresse http://localhost:3000.

## Déploiement sur Vercel (Staging et Production)

### 1. Connecter le Dépôt GitHub à Vercel

1. Créez un compte sur [Vercel](https://vercel.com) si vous n'en avez pas déjà un.
2. Cliquez sur "New Project" dans le dashboard Vercel.
3. Importez le dépôt GitHub de GoofyTrack.
4. Configurez le projet :
   - Framework Preset : Next.js
   - Root Directory : ./
   - Build Command : `yarn build` (ou laissez la valeur par défaut)
   - Output Directory : .next (ou laissez la valeur par défaut)

### 2. Configurer les Variables d'Environnement sur Vercel

1. Dans les paramètres du projet, allez dans l'onglet "Environment Variables".
2. Ajoutez toutes les variables d'environnement nécessaires (voir la liste ci-dessus).
3. Assurez-vous de configurer différentes valeurs pour les environnements de staging et de production.

### 3. Configurer la Base de Données PostgreSQL sur Neon Tech

1. Créez un compte sur [Neon Tech](https://neon.tech) si vous n'en avez pas déjà un.
2. Créez un nouveau projet.
3. Créez une branche principale pour la production et une branche de développement pour le staging.
4. Récupérez les chaînes de connexion pour chaque branche.
5. Ajoutez ces chaînes de connexion comme variables d'environnement `DATABASE_URL` dans Vercel pour les environnements correspondants.

### 4. Configurer les Domaines Personnalisés (Optionnel)

1. Dans les paramètres du projet Vercel, allez dans l'onglet "Domains".
2. Ajoutez vos domaines personnalisés pour les environnements de staging et de production.
3. Suivez les instructions pour configurer les enregistrements DNS.

### 5. Exécuter les Migrations en Production

```bash
# Assurez-vous d'avoir configuré la variable DATABASE_URL pour pointer vers votre base de données de production
npx prisma migrate deploy
```

### 6. Seed la Base de Données en Production (Si Nécessaire)

```bash
# Assurez-vous d'avoir configuré la variable DATABASE_URL pour pointer vers votre base de données de production
npx prisma db seed
```

## Configuration CI/CD avec GitHub Actions

GoofyTrack utilise GitHub Actions pour l'intégration continue et le déploiement continu.

### Workflow de CI/CD

Le fichier de workflow `.github/workflows/ci.yml` configure les actions suivantes :

1. **Lint et Tests** : Exécutés à chaque push et pull request.
2. **Preview Deployment** : Déploiement de prévisualisation pour chaque pull request.
3. **Staging Deployment** : Déploiement automatique sur l'environnement de staging pour chaque merge dans la branche `develop`.
4. **Production Deployment** : Déploiement automatique sur l'environnement de production pour chaque merge dans la branche `main`.

### Configuration du Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      - name: Lint
        run: yarn lint
      - name: Test
        run: yarn test

  preview-deploy:
    needs: lint-and-test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  staging-deploy:
    needs: lint-and-test
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          alias-domains: |
            staging.goofy-track.vercel.app

  production-deploy:
    needs: lint-and-test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          alias-domains: |
            goofy-track.vercel.app
```

### Configuration des Secrets GitHub

Pour que le workflow CI/CD fonctionne, vous devez configurer les secrets suivants dans votre dépôt GitHub :

1. `VERCEL_TOKEN` : Token d'API Vercel
2. `VERCEL_ORG_ID` : ID de l'organisation Vercel
3. `VERCEL_PROJECT_ID` : ID du projet Vercel

## Mise à Jour de la Base de Données

### Créer une Nouvelle Migration

Lorsque vous modifiez le schéma Prisma, vous devez créer une nouvelle migration :

```bash
npx prisma migrate dev --name nom-de-la-migration
```

### Appliquer les Migrations en Production

```bash
npx prisma migrate deploy
```

## Rollback

### Rollback d'un Déploiement sur Vercel

1. Accédez au dashboard du projet sur Vercel.
2. Allez dans l'onglet "Deployments".
3. Trouvez le déploiement précédent que vous souhaitez restaurer.
4. Cliquez sur les trois points à côté du déploiement et sélectionnez "Promote to Production".

### Rollback d'une Migration de Base de Données

Prisma ne prend pas en charge nativement le rollback des migrations. En cas de besoin :

1. Créez une nouvelle migration qui annule les changements de la migration problématique.
2. Appliquez cette nouvelle migration.

## Surveillance et Logging

### Surveillance des Performances

GoofyTrack utilise Vercel Analytics pour surveiller les performances de l'application.

### Logging

Les logs de l'application sont disponibles dans le dashboard Vercel.

## Sauvegarde et Restauration

### Sauvegarde de la Base de Données

Neon Tech effectue des sauvegardes automatiques de la base de données. Pour une sauvegarde manuelle :

```bash
pg_dump -h <host> -U <user> -d <database> > backup.sql
```

### Restauration de la Base de Données

```bash
psql -h <host> -U <user> -d <database> < backup.sql
```

## Bonnes Pratiques

1. **Toujours tester les migrations** dans un environnement de développement avant de les appliquer en production.
2. **Utiliser des branches** pour chaque nouvelle fonctionnalité ou correction.
3. **Vérifier les variables d'environnement** avant chaque déploiement.
4. **Surveiller les logs** après un déploiement pour détecter d'éventuels problèmes.
5. **Effectuer des sauvegardes régulières** de la base de données de production.
