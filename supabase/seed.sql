-- ==========================================
-- SEED DATA FOR LOCAL DEVELOPMENT
-- ==========================================

-- 1. Create a Seed Organization
INSERT INTO public.organizations (id, name, location, admin_phone)
VALUES ('00000000-0000-0000-0000-000000000001', 'Green Dars', 'Valanchery, Kerala', '+919876543210')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Seed Users in auth.users (Supabase Auth Schema)
-- Password is 'password123' for both users
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
  aud
)
VALUES 
  (
    '00000000-0000-0000-0000-000000000100', 
    '00000000-0000-0000-0000-000000000000', 
    'superadmin@assufadars.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"role":"super_admin","full_name":"Super Admin User"}', 
    false, 
    'authenticated',
    'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000200', 
    '00000000-0000-0000-0000-000000000000', 
    'admin@greenclass.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"role":"org_admin","organization_id":"00000000-0000-0000-0000-000000000001","full_name":"Green Class Admin"}', 
    false, 
    'authenticated',
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- Note: The trigger public.handle_new_user() will automatically insert
-- matching profiles in public.profiles upon the insertions above.

-- 3. Create Seed Students for Green Dars
INSERT INTO public.students (id, organization_id, name, place, phone)
VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Ahmad Khan', 'Valanchery', '+919876543211'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Muhammad Bilal', 'Valanchery', '+919876543212'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Fathima Rifa', 'Kottakkal', '+919876543213'),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Zainab Naji', 'Kottakkal', NULL)
ON CONFLICT (id) DO NOTHING;

-- 4. Create Mock Attendance Records for Green Dars on 2026-07-02
INSERT INTO public.attendance (organization_id, student_id, attendance_date, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', '2026-07-02', 'present'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', '2026-07-02', 'present'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013', '2026-07-02', 'absent'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000014', '2026-07-02', 'excused')
ON CONFLICT (organization_id, student_id, attendance_date) DO NOTHING;
