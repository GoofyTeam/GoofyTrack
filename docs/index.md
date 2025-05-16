# Documentation GoofyTrack

Bienvenue dans la documentation technique du projet GoofyTrack, une application de gestion d'événements techniques.

## Table des matières

1. [Architecture](./architecture-diagram.md) - Vue d'ensemble de l'architecture technique
2. [Modèle de données](./er-diagram.md) - Diagramme entité-relation et structure de la base de données
3. [Flux utilisateur](./user-flow-diagram.md) - Parcours utilisateur selon les rôles
4. [Diagramme de séquence](./sequence-diagram.md) - Interactions entre composants
5. [API Reference](./api-reference.md) - Documentation de l'API
6. [Décisions techniques](./technical-decisions.md) - Justifications des choix techniques
7. [Guide de déploiement](./deployment-guide.md) - Instructions pour le déploiement
8. [Guide de contribution](./contributing.md) - Comment contribuer au projet

## À propos de GoofyTrack

GoofyTrack est une application conçue pour gérer un événement technique réunissant des centaines de participants et de conférenciers (type Devoxx France). L'objectif est de proposer un outil simple, fluide et ergonomique pour :

- **Conférenciers** : proposer, modifier ou supprimer des talks
- **Organisateurs** : planifier les interventions et organiser le programme
- **Public** : consulter un planning clair et interactif, filtrer les contenus, et gérer ses favoris

## Technologies utilisées

- **Frontend** : Next.js 15.3.2 avec TypeScript
- **Backend** : API Routes Next.js
- **ORM** : Prisma 6.7.0
- **Base de données** : PostgreSQL
- **Authentification** : NextAuth.js
- **UI** : Tailwind CSS avec composants Radix UI
- **Déploiement** : Vercel
- **CI/CD** : GitHub Actions

## Liens utiles

- [Repository GitHub](https://github.com/GoofyTeam/GoofyTrack)
- [Application déployée](https://goofy-track.vercel.app)
- [Tableau de bord du projet](https://github.com/GoofyTeam/GoofyTrack/projects)
