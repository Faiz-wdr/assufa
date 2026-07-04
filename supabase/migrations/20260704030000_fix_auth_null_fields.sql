-- ==========================================
-- FIX AUTH NULL FIELDS MIGRATION
-- ==========================================

-- 1. Re-define admin_create_organization to prevent future null scan crashes in GoTrue
CREATE OR REPLACE FUNCTION public.admin_create_organization(
    org_name TEXT,
    org_place TEXT,
    admin_name TEXT,
    admin_email TEXT,
    admin_phone TEXT,
    temp_password TEXT
)
RETURNS UUID AS $$
DECLARE
    new_org_id UUID;
    new_user_id UUID;
BEGIN
    -- Check if executor is a super admin
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Only super admins can perform this action';
    END IF;

    -- 1. Create Organization
    INSERT INTO public.organizations (name, location, admin_phone)
    VALUES (org_name, org_place, admin_phone)
    RETURNING id INTO new_org_id;

    -- 2. Create User in auth.users
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role,
        aud,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change,
        email_change_token_current,
        phone_change,
        phone_change_token,
        reauthentication_token
    )
    VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        admin_email,
        crypt(temp_password, gen_salt('bf', 10)),
        now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object(
            'role', 'org_admin',
            'organization_id', new_org_id,
            'full_name', admin_name,
            'phone', admin_phone
        ),
        null, -- set to null to match native signup users
        'authenticated',
        'authenticated',
        now(),
        now(),
        '', -- confirmation_token
        '', -- recovery_token
        '', -- email_change_token_new
        '', -- email_change
        '', -- email_change_token_current
        '', -- phone_change
        '', -- phone_change_token
        ''  -- reauthentication_token
    );

    RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;


-- 2. Fix all existing users in auth.users that were created with null token fields
UPDATE auth.users
SET confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, ''),
    is_super_admin = CASE WHEN is_super_admin = false THEN null ELSE is_super_admin END
WHERE confirmation_token IS NULL
   OR recovery_token IS NULL
   OR email_change_token_new IS NULL
   OR email_change IS NULL
   OR email_change_token_current IS NULL
   OR phone_change IS NULL
   OR phone_change_token IS NULL
   OR reauthentication_token IS NULL
   OR is_super_admin = false;
