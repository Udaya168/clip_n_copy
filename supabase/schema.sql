-- ============================================================================
-- Clip N Copy - Supabase Database Schema & Security Policies (RLS)
-- ============================================================================
-- Architecture: Serverless (React/Vite Frontend -> Supabase DB via Anon Key)
-- Security Enforcement: Row Level Security (RLS) & Storage Bucket Policies
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS & SETUP
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 2. TABLE DEFINITIONS
-- ----------------------------------------------------------------------------

-- A. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price >= price),
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '{}'::jsonb,
  in_stock BOOLEAN DEFAULT true,
  stock_count INTEGER DEFAULT 100 CHECK (stock_count >= 0),
  rating NUMERIC(3, 2) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
  badge TEXT,
  brand TEXT DEFAULT 'Generic',
  images JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  items_count INTEGER DEFAULT 1 CHECK (items_count > 0),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  fulfillment_type TEXT DEFAULT 'Delivery' CHECK (fulfillment_type IN ('Delivery', 'Pickup')),
  address TEXT,
  delivery_method TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  variant TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. INDEXES FOR PERFORMANCE & SECURITY LOOKUPS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ----------------------------------------------------------------------------
-- 4. HELPER SECURITY FUNCTIONS
-- ----------------------------------------------------------------------------

-- Security Definer function to check if the caller has 'admin' role in profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) ACTIVATION
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 6. RLS POLICIES
-- ----------------------------------------------------------------------------

-- ==================== PROFILES POLICIES ====================
-- Users can read their own profile; Admins can read all profiles
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin());

-- Users can insert their own profile on signup
CREATE POLICY "profiles_insert_policy"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own profile (cannot escalate role unless admin)
CREATE POLICY "profiles_update_policy"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (
  (auth.uid() = id AND role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid()))
  OR public.is_admin()
);

-- Admins can delete profiles if necessary
CREATE POLICY "profiles_delete_policy"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==================== PRODUCTS POLICIES ====================
-- Anyone (anon + authenticated) can view active products
CREATE POLICY "products_select_policy"
ON public.products
FOR SELECT
TO public
USING (is_active = true OR public.is_admin());

-- Only admins can insert products
CREATE POLICY "products_insert_policy"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Only admins can update products
CREATE POLICY "products_update_policy"
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only admins can delete products
CREATE POLICY "products_delete_policy"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==================== ORDERS POLICIES ====================
-- Users read their own orders; Admins read all orders
CREATE POLICY "orders_select_policy"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Authenticated users insert their own orders; Admins can insert any order
CREATE POLICY "orders_insert_policy"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Users update their own orders; Admins update all orders
CREATE POLICY "orders_update_policy"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Only admins can delete orders
CREATE POLICY "orders_delete_policy"
ON public.orders
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==================== ORDER ITEMS POLICIES ====================
-- Users read order items for their own orders; Admins read all
CREATE POLICY "order_items_select_policy"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
  )
);

-- Users insert order items for their own orders; Admins insert any
CREATE POLICY "order_items_insert_policy"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
  )
);

-- Only admins can update or delete order items
CREATE POLICY "order_items_update_policy"
ON public.order_items
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "order_items_delete_policy"
ON public.order_items
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. STORAGE BUCKET POLICIES
-- ----------------------------------------------------------------------------

-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('print-uploads', 'print-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- A. PRODUCT-IMAGES BUCKET POLICIES
-- Anyone can view product images
CREATE POLICY "product_images_public_select"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Only admins can upload product images
CREATE POLICY "product_images_admin_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- Only admins can update/delete product images
CREATE POLICY "product_images_admin_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin());

-- B. PRINT-UPLOADS BUCKET POLICIES (Upload & Print Service)
-- Users can upload files to their own subfolder: print-uploads/{user_id}/*
CREATE POLICY "print_uploads_user_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'print-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can read their own uploaded files; Admins can read all print uploads
CREATE POLICY "print_uploads_user_select"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'print-uploads'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
);

-- Users can delete their own uploaded files; Admins can delete any print upload
CREATE POLICY "print_uploads_user_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'print-uploads'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
);

-- ----------------------------------------------------------------------------
-- 8. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 9. ADDRESSES TABLE & SECURITY POLICIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_default ON public.addresses(user_id, is_default);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "addresses_select_policy" ON public.addresses;
DROP POLICY IF EXISTS "addresses_insert_policy" ON public.addresses;
DROP POLICY IF EXISTS "addresses_update_policy" ON public.addresses;
DROP POLICY IF EXISTS "addresses_delete_policy" ON public.addresses;

CREATE POLICY "addresses_select_policy"
ON public.addresses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "addresses_insert_policy"
ON public.addresses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_policy"
ON public.addresses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_delete_policy"
ON public.addresses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

