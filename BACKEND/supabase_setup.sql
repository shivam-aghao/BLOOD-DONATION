-- ===================================================================
-- BloodConnect - Guaranteed Zero-Error Supabase SQL Setup
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/uojujyjhoaxermhxkwqu/sql/new
-- ===================================================================

-- 1. CREATE DONORS TABLE FIRST
CREATE TABLE IF NOT EXISTS public.donar (
    donar_id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    age INT NOT NULL,
    gender TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    city TEXT NOT NULL,
    address TEXT,
    donated_before TEXT DEFAULT 'No',
    last_donation DATE,
    availability TEXT DEFAULT 'Anytime (24/7 SOS)',
    preferred_hospital TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS public.hospitals (
    hospital_id BIGSERIAL PRIMARY KEY,
    hospital_name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    email TEXT,
    operating_hours TEXT DEFAULT '24/7 Emergency Blood Bank',
    inventory JSONB DEFAULT '{"A+": 18, "A-": 4, "B+": 12, "B-": 3, "AB+": 6, "AB-": 2, "O+": 25, "O-": 6}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE BLOOD INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.blood_inventory (
    inventory_id BIGSERIAL PRIMARY KEY,
    hospital_id TEXT,
    blood_group TEXT,
    units_available INT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE SOS REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.sos_requests (
    sos_id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    units INT DEFAULT 1,
    urgency TEXT DEFAULT 'Critical',
    hospital TEXT NOT NULL,
    city TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    booking_id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL,
    hospital_name TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    units INT DEFAULT 1,
    doctor TEXT,
    contact TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DISABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.donar DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

-- 7. GRANT PERMISSIONS TO ANON & AUTHENTICATED
GRANT ALL ON TABLE public.donar TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.hospitals TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.blood_inventory TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sos_requests TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.bookings TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 8. INSERT INITIAL HOSPITALS (Akola)
INSERT INTO public.hospitals (hospital_name, city, address, contact_number, email)
VALUES 
    ('Akola District Civil Hospital & Blood Bank', 'AKOLA', 'Civil Lines, Near Collector Office, Akola', '+91 724 2434567', 'civilhospital@akola.gov.in'),
    ('Ozone Multi-Speciality Hospital', 'AKOLA', 'Murtizapur Road, Near Holy Cross School, Akola', '+91 724 2458900', 'bloodbank@ozonehospital.com'),
    ('Icon Critical Care & Trauma Hospital', 'AKOLA', 'Station Road, Akola', '+91 724 2412345', 'emergency@iconhospital.com');

-- 9. INSERT INITIAL DONORS (Akola)
INSERT INTO public.donar (full_name, age, gender, blood_group, mobile, email, city, address, donated_before, availability, preferred_hospital)
VALUES 
    ('Priya Sharma', 28, 'Female', 'O+', '+91 9876543210', 'priya.sharma@example.com', 'AKOLA', 'Civil Lines, Akola', 'Yes', 'Anytime (24/7 SOS)', 'Akola District Civil Hospital'),
    ('Rahul Deshmukh', 32, 'Male', 'A+', '+91 9822334455', 'rahul.d@example.com', 'AKOLA', 'Ramdas Peth, Akola', 'Yes', 'Weekends only', 'Ozone Multi-Speciality Hospital'),
    ('Anjali Patil', 25, 'Female', 'B+', '+91 9400112233', 'anjali.p@example.com', 'AKOLA', 'Toshniwal Layout, Akola', 'No', 'Anytime (24/7 SOS)', 'Icon Hospital');

-- 10. INSERT INITIAL SOS EMERGENCY REQUEST
INSERT INTO public.sos_requests (sos_id, patient_name, blood_group, units, urgency, hospital, city, contact_name, contact_phone, notes, status)
VALUES 
    ('SOS-101', 'Sunil Gawande', 'O-', 2, 'Immediate (Within 1 Hour)', 'Akola District Civil Hospital', 'AKOLA', 'Dr. Adams (Emergency ICU)', '+91 724 2434567', 'Emergency vascular trauma surgery. Urgent O- donors needed.', 'open')
ON CONFLICT (sos_id) DO NOTHING;
