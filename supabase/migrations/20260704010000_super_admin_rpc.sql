-- ==========================================
-- SUPER ADMIN DATABASE RPC HELPERS
-- ==========================================
-- Enable pgcrypto extension for crypt() / gen_salt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Get All Organizations with Admins & Student Counts
CREATE OR REPLACE FUNCTION public.admin_get_organizations()
RETURNS TABLE (
    organization_id UUID,
    organization_name TEXT,
    place TEXT,
    admin_phone TEXT,
    created_at TIMESTAMPTZ,
    admin_id UUID,
    admin_name TEXT,
    admin_email TEXT,
    total_students BIGINT
) AS $$
BEGIN
    -- Check if executor is a super admin
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Only super admins can perform this action';
    END IF;

    RETURN QUERY
    SELECT 
        o.id AS organization_id,
        o.name AS organization_name,
        o.location AS place,
        o.admin_phone,
        o.created_at,
        p.id AS admin_id,
        p.full_name AS admin_name,
        u.email::TEXT AS admin_email,
        COALESCE(s.student_count, 0)::BIGINT AS total_students
    FROM public.organizations o
    LEFT JOIN public.profiles p ON p.organization_id = o.id AND p.role = 'org_admin'
    LEFT JOIN auth.users u ON u.id = p.id
    LEFT JOIN (
        SELECT students.organization_id, COUNT(*) AS student_count 
        FROM public.students 
        GROUP BY students.organization_id
    ) s ON s.organization_id = o.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. Create Organization & Associated Admin Auth User + Profile
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
        updated_at
    )
    VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        admin_email,
        crypt(temp_password, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object(
            'role', 'org_admin',
            'organization_id', new_org_id,
            'full_name', admin_name,
            'phone', admin_phone
        ),
        false,
        'authenticated',
        'authenticated',
        now(),
        now()
    );

    -- Note: The trigger `on_auth_user_created` will automatically insert
    -- the profile in public.profiles.

    RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

-- 3. Edit Organization & Associated Admin Profile Info
CREATE OR REPLACE FUNCTION public.admin_edit_organization(
    org_id UUID,
    org_name TEXT,
    org_place TEXT,
    admin_name TEXT,
    admin_phone TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Check if executor is a super admin
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Only super admins can perform this action';
    END IF;

    -- Update Organization details
    UPDATE public.organizations
    SET name = org_name,
        location = org_place,
        admin_phone = admin_phone,
        updated_at = now()
    WHERE id = org_id;

    -- Update the Admin profile name & phone
    UPDATE public.profiles
    SET full_name = admin_name,
        phone = admin_phone
    WHERE organization_id = org_id AND role = 'org_admin';
    
    -- Also update raw_user_meta_data in auth.users for completeness
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('full_name', admin_name, 'phone', admin_phone)
    WHERE id IN (SELECT id FROM public.profiles WHERE organization_id = org_id AND role = 'org_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 4. Change Admin User Email
CREATE OR REPLACE FUNCTION public.admin_change_user_email(
    admin_user_id UUID,
    new_email TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Check if executor is a super admin
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Only super admins can perform this action';
    END IF;

    -- Check if target is an org admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = admin_user_id AND role = 'org_admin'
    ) THEN
        RAISE EXCEPTION 'Target user must be an organization admin';
    END IF;

    -- Update email in auth.users
    UPDATE auth.users
    SET email = new_email,
        email_confirmed_at = now(), -- Auto confirm new email
        updated_at = now()
    WHERE id = admin_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 5. Reset Admin User Password
CREATE OR REPLACE FUNCTION public.admin_reset_user_password(
    admin_user_id UUID,
    new_password TEXT
)
RETURNS VOID AS $$
BEGIN
    -- Check if executor is a super admin
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Only super admins can perform this action';
    END IF;

    -- Check if target is an org admin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = admin_user_id AND role = 'org_admin'
    ) THEN
        RAISE EXCEPTION 'Target user must be an organization admin';
    END IF;

    -- Update password in auth.users
    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = now()
    WHERE id = admin_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

-- 6. Delete Organization & Cascading Data (Students, Attendance, Auth User)
CREATE OR REPLACE FUNCTION public.admin_delete_organization(org_id UUID)
RETURNS VOID AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if executor is a super admin
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Only super admins can perform this action';
    END IF;

    -- Find the admin user ID(s) associated with this organization
    FOR admin_user_id IN 
        SELECT id FROM public.profiles WHERE organization_id = org_id
    LOOP
        -- Delete the user from auth.users (cascades to public.profiles)
        DELETE FROM auth.users WHERE id = admin_user_id;
    END LOOP;

    -- Delete the organization (cascades to students and attendance)
    DELETE FROM public.organizations WHERE id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
