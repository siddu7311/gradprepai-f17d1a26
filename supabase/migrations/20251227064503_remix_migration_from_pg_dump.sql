CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: interview_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interview_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    user_id uuid NOT NULL,
    question_number integer NOT NULL,
    question_text text NOT NULL,
    user_answer text,
    ideal_answer text,
    score numeric(5,2),
    strengths text[],
    weaknesses text[],
    technical_score numeric(5,2),
    communication_score numeric(5,2),
    problem_solving_score numeric(5,2),
    confidence_score numeric(5,2),
    feedback text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: interview_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interview_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_type text NOT NULL,
    difficulty text DEFAULT 'intermediate'::text NOT NULL,
    experience_level text,
    company_type text,
    total_questions integer DEFAULT 0 NOT NULL,
    completed_questions integer DEFAULT 0 NOT NULL,
    overall_score numeric(5,2),
    duration_minutes integer,
    status text DEFAULT 'in_progress'::text NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    display_name text,
    avatar_url text,
    email text,
    phone text,
    bio text,
    notification_email boolean DEFAULT true,
    notification_push boolean DEFAULT true,
    notification_interview_reminders boolean DEFAULT true,
    notification_weekly_summary boolean DEFAULT true,
    theme_preference text DEFAULT 'system'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    event_type text DEFAULT 'meeting'::text NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    reminder_minutes integer DEFAULT 15,
    notified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: interview_results interview_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_results
    ADD CONSTRAINT interview_results_pkey PRIMARY KEY (id);


--
-- Name: interview_sessions interview_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_sessions
    ADD CONSTRAINT interview_sessions_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: schedules update_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: interview_results interview_results_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_results
    ADD CONSTRAINT interview_results_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.interview_sessions(id) ON DELETE CASCADE;


--
-- Name: interview_results interview_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_results
    ADD CONSTRAINT interview_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: interview_sessions interview_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_sessions
    ADD CONSTRAINT interview_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: interview_results Users can create their own interview results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own interview results" ON public.interview_results FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: interview_sessions Users can create their own interview sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own interview sessions" ON public.interview_sessions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can create their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: schedules Users can create their own schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own schedules" ON public.schedules FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: schedules Users can delete their own schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own schedules" ON public.schedules FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: interview_results Users can update their own interview results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own interview results" ON public.interview_results FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: interview_sessions Users can update their own interview sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own interview sessions" ON public.interview_sessions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: schedules Users can update their own schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own schedules" ON public.schedules FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: interview_results Users can view their own interview results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own interview results" ON public.interview_results FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: interview_sessions Users can view their own interview sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own interview sessions" ON public.interview_sessions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: schedules Users can view their own schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own schedules" ON public.schedules FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: interview_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.interview_results ENABLE ROW LEVEL SECURITY;

--
-- Name: interview_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;