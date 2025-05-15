# API Reference

Cette documentation détaille les endpoints de l'API GoofyTrack, leurs paramètres, et les réponses attendues.

## Base URL

```
https://goofy-track.vercel.app/api
```

Pour le développement local :
```
http://localhost:3000/api
```

## Authentification

Tous les endpoints protégés nécessitent un token JWT valide, fourni via le header `Authorization`.

```
Authorization: Bearer <token>
```

Le token est obtenu via le endpoint d'authentification NextAuth.js.

## Endpoints

### Authentification

#### `POST /auth/[...nextauth]`

Endpoint NextAuth.js pour la gestion de l'authentification.

<!-- ### Utilisateurs -->

<!-- #### `GET /users` -->

<!-- Récupère la liste des utilisateurs (réservé aux administrateurs).

**Réponse**

```json
[
  {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role_id": 1,
    "avatarUrl": "https://example.com/avatar.jpg",
    "bio": "Développeur passionné",
    "created_at": "2025-05-01T10:00:00Z",
    "updated_at": "2025-05-01T10:00:00Z"
  }
]
```

#### `GET /users/:id`

Récupère les détails d'un utilisateur spécifique.

**Paramètres**

| Nom | Type | Description |
|-----|------|-------------|
| id  | number | ID de l'utilisateur |

**Réponse**

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role_id": 1,
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Développeur passionné",
  "created_at": "2025-05-01T10:00:00Z",
  "updated_at": "2025-05-01T10:00:00Z"
}
```

#### `POST /users`

Crée un nouvel utilisateur.

**Corps de la requête**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "role_id": 1,
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Développeur passionné"
}
``` -->

<!-- **Réponse**

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role_id": 1,
  "avatarUrl": "https://example.com/avatar.jpg",
  "bio": "Développeur passionné",
  "created_at": "2025-05-01T10:00:00Z",
  "updated_at": "2025-05-01T10:00:00Z"
}
``` -->

### Talks

#### `GET /talks`

Récupère la liste des talks.

**Paramètres de requête**

| Nom | Type | Description |
|-----|------|-------------|
| status | string | Filtre par statut (pending, accepted, rejected, scheduled) |
| subject_id | number | Filtre par sujet |
| speaker_id | number | Filtre par conférencier |
| level | string | Filtre par niveau (beginner, intermediate, advanced, expert) |

**Réponse**

```json
[
  {
    "id": 1,
    "title": "Introduction à Next.js",
    "description": "Une présentation des bases de Next.js",
    "speaker_id": 1,
    "subject_id": 3,
    "duration": 45,
    "level": "beginner",
    "status": "accepted",
    "created_at": "2025-05-01T10:00:00Z",
    "updated_at": "2025-05-01T10:00:00Z"
  }
]
```

#### `GET /talks/:id`

Récupère les détails d'un talk spécifique.

**Paramètres**

| Nom | Type | Description |
|-----|------|-------------|
| id  | number | ID du talk |

**Réponse**

```json
{
  "id": 1,
  "title": "Introduction à Next.js",
  "description": "Une présentation des bases de Next.js",
  "speaker_id": 1,
  "subject_id": 3,
  "duration": 45,
  "level": "beginner",
  "status": "accepted",
  "created_at": "2025-05-01T10:00:00Z",
  "updated_at": "2025-05-01T10:00:00Z",
  "speaker": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "subject": {
    "id": 3,
    "name": "Next.js"
  }
}
```

#### `POST /talks`

Crée un nouveau talk (réservé aux conférenciers).

**Corps de la requête**

```json
{
  "title": "Introduction à Next.js",
  "description": "Une présentation des bases de Next.js",
  "subject_id": 3,
  "duration": 45,
  "level": "beginner"
}
```

**Réponse**

```json
{
  "id": 1,
  "title": "Introduction à Next.js",
  "description": "Une présentation des bases de Next.js",
  "speaker_id": 1,
  "subject_id": 3,
  "duration": 45,
  "level": "beginner",
  "status": "pending",
  "created_at": "2025-05-01T10:00:00Z",
  "updated_at": "2025-05-01T10:00:00Z"
}
```

#### `PUT /talks/:id`

Met à jour un talk existant (réservé au conférencier propriétaire ou aux organisateurs).

**Paramètres**

| Nom | Type | Description |
|-----|------|-------------|
| id  | number | ID du talk |

**Corps de la requête**

```json
{
  "title": "Introduction à Next.js et React",
  "description": "Une présentation des bases de Next.js et React",
  "subject_id": 3,
  "duration": 60,
  "level": "intermediate"
}
```

**Réponse**

```json
{
  "id": 1,
  "title": "Introduction à Next.js et React",
  "description": "Une présentation des bases de Next.js et React",
  "speaker_id": 1,
  "subject_id": 3,
  "duration": 60,
  "level": "intermediate",
  "status": "pending",
  "created_at": "2025-05-01T10:00:00Z",
  "updated_at": "2025-05-01T10:30:00Z"
}
```

#### `DELETE /talks/:id`

Supprime un talk (réservé au conférencier propriétaire ou aux organisateurs).

**Paramètres**

| Nom | Type | Description |
|-----|------|-------------|
| id  | number | ID du talk |

**Réponse**

```
Status: 204 No Content
```

### Planning

#### `GET /schedules`

Récupère le planning des talks.

**Paramètres de requête**

| Nom | Type | Description |
|-----|------|-------------|
| room_id | number | Filtre par salle |
| date | string | Filtre par date (YYYY-MM-DD) |

**Réponse**

```json
[
  {
    "id": 1,
    "talk_id": 1,
    "room_id": 2,
    "start_time": "2025-06-01T10:00:00Z",
    "end_time": "2025-06-01T10:45:00Z",
    "created_at": "2025-05-01T10:00:00Z",
    "updated_at": "2025-05-01T10:00:00Z",
    "talk": {
      "id": 1,
      "title": "Introduction à Next.js",
      "speaker_id": 1,
      "level": "beginner"
    },
    "room": {
      "id": 2,
      "name": "Salle Conférences A",
      "capacity": 150
    }
  }
]
```

#### `POST /schedules`

Planifie un talk (réservé aux organisateurs).

**Corps de la requête**

```json
{
  "talk_id": 1,
  "room_id": 2,
  "start_time": "2025-06-01T10:00:00Z",
  "end_time": "2025-06-01T10:45:00Z"
}
```

**Réponse**

```json
{
  "id": 1,
  "talk_id": 1,
  "room_id": 2,
  "start_time": "2025-06-01T10:00:00Z",
  "end_time": "2025-06-01T10:45:00Z",
  "created_at": "2025-05-01T10:00:00Z",
  "updated_at": "2025-05-01T10:00:00Z"
}
```

### Favoris

#### `GET /favorites`

Récupère les favoris de l'utilisateur connecté.

**Réponse**

```json
[
  {
    "id": 1,
    "user_id": 1,
    "talk_id": 1,
    "created_at": "2025-05-01T10:00:00Z",
    "talk": {
      "id": 1,
      "title": "Introduction à Next.js",
      "speaker_id": 1,
      "level": "beginner"
    }
  }
]
```

#### `POST /favorites`

Ajoute un talk aux favoris.

**Corps de la requête**

```json
{
  "talk_id": 1
}
```

**Réponse**

```json
{
  "id": 1,
  "user_id": 1,
  "talk_id": 1,
  "created_at": "2025-05-01T10:00:00Z"
}
```

#### `DELETE /favorites/:id`

Supprime un talk des favoris.

**Paramètres**

| Nom | Type | Description |
|-----|------|-------------|
| id  | number | ID du favori |

**Réponse**

```
Status: 204 No Content
```

### Feedback

#### `POST /feedback`

Ajoute un feedback pour un talk.

**Corps de la requête**

```json
{
  "talk_id": 1,
  "rating": true,
  "comment": "Excellent talk, très instructif !"
}
```

**Réponse**

```json
{
  "id": 1,
  "user_id": 1,
  "talk_id": 1,
  "rating": true,
  "comment": "Excellent talk, très instructif !",
  "created_at": "2025-05-01T10:00:00Z"
}
```

### Statistiques

#### `GET /stats/talks`

Récupère des statistiques sur les talks (réservé aux organisateurs).

**Réponse**

```json
{
  "total": 50,
  "by_status": {
    "pending": 10,
    "accepted": 30,
    "rejected": 5,
    "scheduled": 25
  },
  "by_subject": {
    "JavaScript": 10,
    "TypeScript": 8,
    "React": 12,
    "Next.js": 15,
    "Node.js": 5
  },
  "by_level": {
    "beginner": 15,
    "intermediate": 20,
    "advanced": 10,
    "expert": 5
  }
}
```

#### `GET /stats/rooms`

Récupère des statistiques sur l'occupation des salles (réservé aux organisateurs).

**Réponse**

```json
[
  {
    "room_id": 1,
    "room_name": "Salle Amphithéâtre",
    "capacity": 300,
    "talks_count": 10,
    "occupation_rate": 0.8,
    "total_duration": 450
  }
]
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400  | Bad Request - La requête est mal formée |
| 401  | Unauthorized - Authentification requise |
| 403  | Forbidden - Permissions insuffisantes |
| 404  | Not Found - Ressource non trouvée |
| 409  | Conflict - Conflit avec l'état actuel |
| 422  | Unprocessable Entity - Validation échouée |
| 500  | Internal Server Error - Erreur serveur |

## Pagination

Pour les endpoints qui retournent de nombreux résultats, la pagination est supportée via les paramètres de requête suivants :

| Nom | Type | Description |
|-----|------|-------------|
| page | number | Numéro de page (commence à 1) |
| limit | number | Nombre d'éléments par page (défaut: 10, max: 50) |

**Exemple**

```
GET /api/talks?page=2&limit=20
```

**Réponse**

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 2,
    "limit": 20,
    "pages": 5
  }
}
```
