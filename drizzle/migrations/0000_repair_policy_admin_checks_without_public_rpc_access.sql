CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA app_private TO authenticated;
CREATE OR REPLACE FUNCTION app_private.current_user_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = (SELECT auth.uid()) AND role = 'admin'::public.app_role); $$;
REVOKE ALL ON FUNCTION app_private.current_user_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_private.current_user_is_admin() TO authenticated;
ALTER POLICY "Admins can view all profiles" ON public.profiles USING (app_private.current_user_is_admin());
ALTER POLICY "Admins can insert roles" ON public.user_roles WITH CHECK (app_private.current_user_is_admin());
ALTER POLICY "Admins can update roles" ON public.user_roles USING (app_private.current_user_is_admin());
ALTER POLICY "Admins can delete roles" ON public.user_roles USING (app_private.current_user_is_admin());
ALTER POLICY "Admins can view all roles" ON public.user_roles USING (app_private.current_user_is_admin());
ALTER POLICY "Admins can update requests" ON public.enterprise_requests USING (app_private.current_user_is_admin());
ALTER POLICY "Admins can view all requests" ON public.enterprise_requests USING (app_private.current_user_is_admin());
ALTER POLICY "Admins can view all payments" ON public.upi_payments USING (app_private.current_user_is_admin());