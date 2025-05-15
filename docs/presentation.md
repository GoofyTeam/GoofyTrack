# Présentation GoofyTrack

## 1. 👥 Organisation de l'équipe

### Présentation des rôles
- **Lead Developer** : Responsable de l'architecture technique et des décisions de conception
- **Scrum Master** : Facilite les processus agiles et supprime les obstacles
- **UI/UX Designer** : Conception de l'interface utilisateur et de l'expérience utilisateur
- **Frontend Developer** : Développement de l'interface utilisateur avec Next.js
- **Backend Developer** : Développement des API et de la logique métier

### Méthodologie choisie : Scrum
- **Sprints** de 1 semaine avec planning, daily et rétrospective
- **Backlog** priorisé et mis à jour régulièrement
- **User Stories** clairement définies avec critères d'acceptation

### Outils utilisés
- **GitHub** : Gestion du code source et des pull requests
- **Discord** : Communication d'équipe et partage d'informations
- **Trello/GitHub Projects** : Suivi des tâches et visualisation du sprint
- **Figma** : Conception des maquettes et prototypes

### Workflow Git
1. Création d'une branche feature à partir de develop
2. Développement et tests locaux
3. Pull request avec code review
4. Merge dans develop après validation
5. Déploiement en production via la branche main

🎯 **Objectif** : Notre organisation a permis une communication fluide et une répartition claire des tâches, facilitant le développement rapide et efficace de notre MVP.

## 2. 🧱 Présentation de la stack technique

### Frontend
- **Next.js** : Framework React pour le développement d'applications web
- **Tailwind CSS** : Framework CSS utilitaire pour un design responsive
- **Zustand** : Gestion d'état global simple et efficace
- **React Query** : Gestion des requêtes API et du cache

### Backend
- **Next.js API Routes** : API REST intégrée à notre application Next.js
- **Prisma** : ORM moderne pour interagir avec notre base de données
- **NextAuth.js** : Solution d'authentification complète avec gestion des rôles

### Base de données
- **PostgreSQL** : Base de données relationnelle robuste
- **Prisma Schema** : Modélisation des données avec migrations automatiques

### Déploiement
- **Vercel** : Plateforme de déploiement optimisée pour Next.js
- **Docker** : Conteneurisation pour le développement local
- **GitHub Actions** : CI/CD pour les tests automatisés et le déploiement

### Architecture logicielle
- **Architecture en couches** : Séparation claire entre UI, logique métier et accès aux données
- **API RESTful** : Communication standardisée entre frontend et backend
- **Responsive Design** : Adaptation à tous les appareils (desktop, tablette, mobile)

🎯 **Objectif** : Notre stack technique moderne nous permet de développer rapidement, de maintenir facilement et de faire évoluer notre application selon les besoins.

## 3. 🧭 Expression du besoin

### Problème à résoudre
L'organisation d'événements techniques (type Devoxx France) nécessite une gestion complexe des conférences, des salles et des horaires. Les solutions existantes sont souvent trop rigides ou trop complexes pour les organisateurs.

### Utilisateurs cibles
- **Conférenciers** : Professionnels souhaitant partager leur expertise
- **Organisateurs** : Équipe responsable de la planification et de la logistique
- **Public** : Participants cherchant à optimiser leur parcours durant l'événement

### Contexte d'utilisation
- **Conférenciers** : Avant l'événement pour proposer des talks, pendant pour suivre leur statut
- **Organisateurs** : Phase de préparation et pendant l'événement pour ajustements
- **Public** : Avant et pendant l'événement pour consulter et planifier leur agenda

🎯 **Objectif** : GoofyTrack simplifie la gestion des conférences techniques en offrant une plateforme intuitive pour tous les acteurs impliqués.

## 4. 💡 Fonctionnalité principale

### Gestion complète du cycle de vie des talks
Notre fonctionnalité essentielle est la gestion des talks depuis leur proposition jusqu'à leur planification dans le programme de l'événement.

#### Parcours utilisateur
1. Le conférencier soumet un talk via un formulaire détaillé
2. L'organisateur évalue la proposition et change son statut (accepté/refusé)
3. L'organisateur attribue un créneau et une salle aux talks acceptés
4. Le public consulte le planning et filtre selon ses intérêts

#### Priorité de cette fonctionnalité
Cette fonctionnalité est le cœur de notre application car elle répond au besoin principal de tous nos utilisateurs : la gestion efficace du contenu de l'événement.

#### Réponse au besoin utilisateur
- **Conférenciers** : Interface simple pour proposer et suivre leurs talks
- **Organisateurs** : Outils de validation et planification avec vérification des conflits
- **Public** : Vue claire et filtrable du programme

#### Démonstration
[Insérer ici des captures d'écran ou lien vers une démo]

🎯 **Objectif** : Notre solution offre une expérience fluide et intuitive pour la gestion des talks, éliminant les frictions habituelles dans l'organisation d'événements.

## 5. 🔭 Axes d'amélioration et évolutions futures

### Système de recommandation personnalisé
Nous envisageons d'implémenter un système de recommandation basé sur les préférences des utilisateurs et leur historique de participation.

### Génération automatique de planning
Développement d'un algorithme d'optimisation pour générer automatiquement un planning optimal en tenant compte des contraintes (salles, disponibilités des conférenciers, thématiques).

### Application mobile native
Création d'une application mobile dédiée avec fonctionnalités hors-ligne et notifications push.

### Raisons de priorisation ultérieure
Ces fonctionnalités n'ont pas été intégrées au MVP pour plusieurs raisons :
- Contraintes de temps pour le développement initial
- Nécessité de valider d'abord le concept de base
- Complexité technique nécessitant une phase de recherche approfondie

🎯 **Objectif** : Ces évolutions permettront d'enrichir l'expérience utilisateur et d'augmenter la valeur ajoutée de notre plateforme.

## 6. 🤝 Soft skills et bilan de groupe

### Apprentissages
- **Gestion d'équipe** : Importance de la clarté des rôles et de la responsabilisation
- **Communication** : Bénéfices des daily meetings courts et des canaux de communication dédiés
- **Résolution de problèmes** : Approche collaborative face aux défis techniques

### Gestion des difficultés
Face au défi de l'intégration de NextAuth avec Prisma, nous avons organisé une session de pair programming qui a permis de résoudre rapidement le problème tout en partageant les connaissances.

### Améliorations futures
Si nous recommencions le projet, nous :
- Consacrerions plus de temps à la phase de conception initiale
- Mettrions en place des tests automatisés dès le début
- Établirions des conventions de code plus strictes

🎯 **Objectif** : Cette expérience nous a permis de grandir en tant qu'équipe et d'acquérir des compétences précieuses pour nos futurs projets professionnels.