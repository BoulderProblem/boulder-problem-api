CREATE USER adonis with encrypted password 'adonis';
CREATE DATABASE adonis_app;
GRANT ALL ON DATABASE adonis_app TO adonis;
GRANT ALL ON SCHEMA public TO adonis;