-- ==========================================
-- Phase 7: Settings & Theme Preference
-- ==========================================

-- 1. Add theme_preference column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme_preference TEXT NOT NULL DEFAULT 'light'
  CHECK (theme_preference IN ('light', 'dark'));

-- 2. Allow org_admin to update their organization's location/name
CREATE POLICY "Org admins can update their own organization"
    ON public.organizations FOR UPDATE
    USING (id = public.get_user_org_id())
    WITH CHECK (id = public.get_user_org_id());

-- 3. Allow org_admin to update their own theme preference
-- (already covered by "Users can update their own profile" policy)
