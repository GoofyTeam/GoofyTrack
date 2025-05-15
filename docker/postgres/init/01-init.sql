-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'Europe/Paris';

-- Create schema if not exists
-- CREATE SCHEMA IF NOT EXISTS goofytrack;

-- Set search path
-- SET search_path TO goofytrack, public;

-- Add comments to database
COMMENT ON DATABASE goofytrack IS 'GoofyTrack - Application de gestion d''événements techniques';
