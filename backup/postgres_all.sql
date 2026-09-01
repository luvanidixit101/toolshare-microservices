--
-- PostgreSQL database cluster dump
--

\restrict CIqvdeCfhN7i8fo4AS9i5ahEchF15YoMlXrb6LhulXr2tihaV8xwcG5yW9sZ2cr

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE admin;
ALTER ROLE admin WITH NOSUPERUSER INHERIT NOCREATEROLE CREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:UF7p2lPGQ4U9U/ulSPO2NA==$IoISp4o5wXhSfk2XkQJkMcPfZ3fcoGFyyyGJpKVJxCo=:83L92WwsoayodxmuKbkNhWSuhkw3fZedzEmMK3kOw2s=';
CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:EaRu8ANvul7ggOb9E18iow==$XCE0ducWkJrDl/ImgX9BIzv5PMZm9qINxhlicfH4gjA=:yTRuP8U8w06FpC0SCFDWYKkIvPjv2P7birN/KrGp7m8=';
CREATE ROLE toolshare_user;
ALTER ROLE toolshare_user WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:c1fcY64fbWToJev1xtxKmg==$r6x0pOtt0hsrJWDGYylp+z80CqQUtk0hY7xlYBfudrc=:J1YsLTtrN2QxcJCTHDIF3hkIdmYw96dn9GaeVpbaCOs=';

--
-- User Configurations
--








\unrestrict CIqvdeCfhN7i8fo4AS9i5ahEchF15YoMlXrb6LhulXr2tihaV8xwcG5yW9sZ2cr

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict pA8lHTI3QjY7B1dVoCLiCadDZbQ95UlxTKXy6SsLEJyVPrn6TgAxJYFbOhFqtra

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict pA8lHTI3QjY7B1dVoCLiCadDZbQ95UlxTKXy6SsLEJyVPrn6TgAxJYFbOhFqtra

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict d9CjrQV6guxorDhidggUpYkcXcf6ycjgrZr2GZL0bHzV9NNawtUL01v6Yzf7Uvz

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


--
-- PostgreSQL database dump complete
--

\unrestrict d9CjrQV6guxorDhidggUpYkcXcf6ycjgrZr2GZL0bHzV9NNawtUL01v6Yzf7Uvz

--
-- Database "toolshare" dump
--

--
-- PostgreSQL database dump
--

\restrict NKt2TtTMaoBJcwp1ROPBmhJn8pZ5uWHdTjQVn9c4L8nUafkfivh8v8sfDhvDpAE

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: toolshare; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE toolshare WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';


ALTER DATABASE toolshare OWNER TO postgres;

\unrestrict NKt2TtTMaoBJcwp1ROPBmhJn8pZ5uWHdTjQVn9c4L8nUafkfivh8v8sfDhvDpAE
\connect toolshare
\restrict NKt2TtTMaoBJcwp1ROPBmhJn8pZ5uWHdTjQVn9c4L8nUafkfivh8v8sfDhvDpAE

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE toolshare; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON DATABASE toolshare TO admin;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO admin;


--
-- PostgreSQL database dump complete
--

\unrestrict NKt2TtTMaoBJcwp1ROPBmhJn8pZ5uWHdTjQVn9c4L8nUafkfivh8v8sfDhvDpAE

--
-- Database "toolshare_ai" dump
--

