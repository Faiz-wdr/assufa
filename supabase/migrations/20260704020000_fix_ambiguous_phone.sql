-- ==========================================
-- FIX AMBIGUOUS COLUMN REFERENCE IN EDIT RPC
-- ==========================================

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

    -- Update Organization details using qualified parameter references
    UPDATE public.organizations o
    SET name = org_name,
        location = org_place,
        admin_phone = admin_edit_organization.admin_phone,
        updated_at = now()
    WHERE o.id = org_id;

    -- Update the Admin profile name & phone
    UPDATE public.profiles p
    SET full_name = admin_name,
        phone = admin_edit_organization.admin_phone
    WHERE p.organization_id = org_id AND p.role = 'org_admin';
    
    -- Also update raw_user_meta_data in auth.users for completeness
    UPDATE auth.users u
    SET raw_user_meta_data = u.raw_user_meta_data || jsonb_build_object(
        'full_name', admin_name, 
        'phone', admin_edit_organization.admin_phone
    )
    WHERE u.id IN (SELECT id FROM public.profiles WHERE organization_id = org_id AND role = 'org_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
