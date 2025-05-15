# Diagramme Entité-Relation

Ce diagramme représente les relations entre les différentes entités de la base de données GoofyTrack, basé sur le schéma Prisma.

```mermaid
erDiagram
    User {
        int id PK
        string username
        string email UK
        string password
        int role_id FK
        string avatarUrl
        string bio
        datetime created_at
        datetime updated_at
    }
    
    roles {
        int id PK
        string name UK
        datetime created_at
    }
    
    talks {
        int id PK
        string title
        string description
        int speaker_id FK
        int subject_id FK
        int duration
        enum level
        enum status
        datetime created_at
        datetime updated_at
    }
    
    subjects {
        int id PK
        string name UK
        datetime created_at
    }
    
    rooms {
        int id PK
        string name UK
        int capacity
        string description
        datetime created_at
    }
    
    schedules {
        int id PK
        int talk_id FK,UK
        int room_id FK
        datetime start_time
        datetime end_time
        datetime created_at
        datetime updated_at
    }
    
    favorites {
        int id PK
        int user_id FK
        int talk_id FK
        datetime created_at
        composite user_id_talk_id UK
    }
    
    feedback {
        int id PK
        int user_id FK
        int talk_id FK
        boolean rating
        string comment
        datetime created_at
        composite user_id_talk_id UK
    }
    
    talks_level {
        beginner
        intermediate
        advanced
        expert
    }
    
    talks_status {
        pending
        accepted
        rejected
        scheduled
    }
    
    User ||--o{ talks : "propose"
    User ||--o{ favorites : "saves"
    User ||--o{ feedback : "gives"
    roles ||--o{ User : "has"
    subjects ||--o{ talks : "categorizes"
    talks ||--o{ favorites : "saved in"
    talks ||--o{ feedback : "receives"
    talks ||--o| schedules : "scheduled as"
    rooms ||--o{ schedules : "hosts"
    talks }|--|| talks_level : "has"
    talks }|--|| talks_status : "has"
