-- ==========================================
-- Allow org admins to update their own organization
-- ==========================================
-- This policy was missing from the initial schema.
-- Without it, org admins can only SELECT their org but cannot UPDATE it,
-- which prevents the Settings page from saving the class place.

CREATE POLICY "Organization admins can update their own organization"
    ON public.organizations FOR UPDATE
    USING (id = public.get_user_org_id())
    WITH CHECK (id = public.get_user_org_id());
