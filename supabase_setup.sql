-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Variants Table
CREATE TABLE IF NOT EXISTS variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  color TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;

-- 4. SECURE POLICIES (Cleanup first to avoid "already exists" errors)
DROP POLICY IF EXISTS "Allow public read-only access on products" ON products;
DROP POLICY IF EXISTS "Allow public read-only access on variants" ON variants;
DROP POLICY IF EXISTS "Allow auth admin all access on products" ON products;
DROP POLICY IF EXISTS "Allow auth admin all access on variants" ON variants;

-- Re-create Policies
CREATE POLICY "Allow public read-only access on products" 
ON products FOR SELECT USING (true);

CREATE POLICY "Allow public read-only access on variants" 
ON variants FOR SELECT USING (true);

CREATE POLICY "Allow auth admin all access on products" 
ON products FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow auth admin all access on variants" 
ON variants FOR ALL TO authenticated USING (true);

-- 5. Storage Policies (Cleanup first)
-- Run these ONLY AFTER creating the 'product-images' bucket in the UI
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- Re-create Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');
