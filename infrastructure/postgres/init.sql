-- infrastructure/postgres/init.sql
-- Create multiple databases for services that need their own DB

CREATE DATABASE keycloak;
CREATE DATABASE kong;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE keycloak TO postgres;
GRANT ALL PRIVILEGES ON DATABASE kong TO postgres;

-- Connect to docvault DB and create extensions
\c docvault;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Full text search configuration
CREATE TEXT SEARCH CONFIGURATION docvault_search (COPY = english);