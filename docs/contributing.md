# Guide de Contribution

Merci de votre intérêt pour contribuer au projet GoofyTrack ! Ce document vous guidera à travers le processus de contribution.

## Prérequis

- Node.js v18 ou supérieur
- Docker et Docker Compose
- Git
- Un éditeur de code (VS Code recommandé)

## Installation de l'environnement de développement

1. **Cloner le dépôt**

```bash
git clone https://github.com/GoofyTeam/GoofyTrack.git
cd GoofyTrack
```

2. **Installer les dépendances**

```bash
npm install
# ou
yarn install
```

3. **Configurer les variables d'environnement**

```bash
cp .env.dist .env
# Modifier les variables dans .env selon vos besoins
```

4. **Démarrer les services Docker**

```bash
docker-compose up -d
```

5. **Exécuter les migrations**

```bash
npx prisma migrate dev
```

6. **Seed la base de données**

```bash
npx prisma db seed
```

7. **Démarrer l'application en mode développement**

```bash
npm run dev
# ou
yarn dev
```

L'application sera disponible à l'adresse http://localhost:3000.

## Workflow Git

Nous utilisons un workflow Git inspiré de GitFlow :

### Branches principales

- `main` : Code en production
- `develop` : Code de développement stable

### Branches de fonctionnalités

Pour développer une nouvelle fonctionnalité :

1. Créer une branche à partir de `develop` :

```bash
git checkout develop
git pull
git checkout -b feature/nom-de-la-fonctionnalite
```

2. Développer la fonctionnalité dans cette branche
3. Pousser la branche vers le dépôt distant :

```bash
git push -u origin feature/nom-de-la-fonctionnalite
```

4. Créer une Pull Request vers la branche `develop`

### Branches de correction

Pour corriger un bug en production :

1. Créer une branche à partir de `main` :

```bash
git checkout main
git pull
git checkout -b hotfix/nom-du-correctif
```

2. Développer le correctif
3. Pousser la branche vers le dépôt distant :

```bash
git push -u origin hotfix/nom-du-correctif
```

4. Créer une Pull Request vers la branche `main` et une autre vers `develop`

## Convention de Commits

Nous utilisons la convention de commits suivante :

```
<type>(<scope>): <description>

[corps]

[pied de page]
```

### Types de commits

- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Modification de la documentation
- `style` : Changements de formatage (espaces, indentation, etc.)
- `refactor` : Refactorisation du code
- `test` : Ajout ou modification de tests
- `chore` : Tâches de maintenance

### Exemples

```
feat(auth): ajouter l'authentification Google

Ajouter la possibilité de se connecter avec un compte Google.

Closes #123
```

```
fix(planning): corriger le chevauchement des talks

Résoudre le problème de chevauchement des talks dans le planning.

Fixes #456
```

## Pull Requests

### Création d'une Pull Request

1. Assurez-vous que votre code est bien formaté et que les tests passent
2. Créez une Pull Request sur GitHub
3. Remplissez le template de PR avec :
   - Une description claire de ce que fait la PR
   - Les issues liées
   - Les captures d'écran (si applicable)
   - Les étapes de test

### Revue de Code

Chaque PR doit être revue par au moins un autre membre de l'équipe avant d'être fusionnée.

### Critères d'acceptation

- Les tests automatisés passent
- Le code respecte les standards de qualité
- La PR a été revue et approuvée
- La fonctionnalité répond aux exigences

## Standards de Code

### Linting et Formatage

Nous utilisons ESLint et Prettier pour maintenir la qualité du code. Configurez votre éditeur pour formater le code automatiquement à la sauvegarde.

Pour vérifier le formatage :

```bash
npm run lint
# ou
yarn lint
```

Pour corriger automatiquement les problèmes de formatage :

```bash
npm run lint:fix
# ou
yarn lint:fix
```

### Tests

Nous utilisons Jest et React Testing Library pour les tests. Chaque nouvelle fonctionnalité doit être accompagnée de tests.

Pour exécuter les tests :

```bash
npm run test
# ou
yarn test
```

Pour exécuter les tests avec couverture :

```bash
npm run test:coverage
# ou
yarn test:coverage
```

### TypeScript

Tout le code doit être écrit en TypeScript avec un typage approprié. Évitez d'utiliser `any` autant que possible.

## Structure du Projet

```
/app
  /api             # API Routes
  /components      # Composants React partagés
  /features        # Fonctionnalités organisées par domaine
    /auth
    /talks
    /schedule
    /favorites
  /hooks           # Hooks React personnalisés
  /lib             # Utilitaires et services
  /prisma          # Schéma et migrations Prisma
  /public          # Fichiers statiques
  /styles          # Styles globaux
```

### Directives pour les composants

- Utilisez des composants fonctionnels avec des hooks
- Utilisez TypeScript pour typer les props
- Suivez le principe de responsabilité unique
- Utilisez des tests pour les composants

### Directives pour l'API

- Utilisez les API Routes de Next.js
- Validez les entrées avec Zod
- Gérez correctement les erreurs
- Documentez les endpoints

## Base de Données

### Modifications du Schéma

Pour modifier le schéma de la base de données :

1. Modifiez le fichier `prisma/schema.prisma`
2. Générez une migration :

```bash
npx prisma migrate dev --name nom-de-la-migration
```

3. Vérifiez que la migration fonctionne correctement
4. Mettez à jour les seeds si nécessaire

### Requêtes à la Base de Données

Utilisez le client Prisma pour interagir avec la base de données. Évitez les requêtes SQL brutes sauf si nécessaire.

## Documentation

### Documentation du Code

Documentez votre code avec des commentaires JSDoc :

```typescript
/**
 * Récupère un talk par son ID
 * @param id - L'ID du talk à récupérer
 * @returns Le talk correspondant ou null s'il n'existe pas
 */
async function getTalkById(id: number): Promise<Talk | null> {
  // ...
}
```

### Documentation de l'API

Documentez les endpoints API dans le fichier `docs/api-reference.md`.

### Mise à Jour de la Documentation

Lorsque vous ajoutez ou modifiez une fonctionnalité, assurez-vous de mettre à jour la documentation correspondante.

## Déploiement

Le déploiement est géré automatiquement par notre pipeline CI/CD. Consultez le [Guide de Déploiement](./deployment-guide.md) pour plus d'informations.

## Signalement de Bugs

Si vous trouvez un bug :

1. Vérifiez si le bug a déjà été signalé dans les issues GitHub
2. Si ce n'est pas le cas, créez une nouvelle issue avec :
   - Une description claire du bug
   - Les étapes pour reproduire
   - Le comportement attendu
   - Le comportement observé
   - Des captures d'écran si applicable
   - Des informations sur l'environnement

## Proposer des Améliorations

Pour proposer une amélioration :

1. Créez une issue GitHub décrivant votre proposition
2. Discutez de la proposition avec l'équipe
3. Si la proposition est acceptée, suivez le workflow standard pour implémenter la fonctionnalité

## Communication

- **GitHub Issues** : Pour le suivi des bugs et des fonctionnalités
- **Pull Requests** : Pour les revues de code
- **Discord** : Pour la communication en temps réel (demandez le lien d'invitation)
- **Daily Meetings** : Pour la synchronisation quotidienne de l'équipe

## Ressources Utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation NextAuth.js](https://next-auth.js.org/getting-started/introduction)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation TypeScript](https://www.typescriptlang.org/docs)

Merci de contribuer à GoofyTrack ! 🚀
