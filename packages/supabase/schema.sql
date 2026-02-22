-- ============================================================
-- OpenFridge Schema
-- Run this in your Supabase SQL Editor (supabase.com → SQL)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Machines ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  lock_enabled BOOLEAN NOT NULL DEFAULT false,
  lock_api_url TEXT,
  lock_api_key TEXT,
  lock_duration_sec INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Inventory ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock_count INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_machine_id ON inventory(machine_id);

-- ── Sales ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  payment_method TEXT NOT NULL DEFAULT 'card' CHECK (payment_method IN ('card', 'apple_pay', 'crypto')),
  sold_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_machine_id ON sales(machine_id);
CREATE INDEX idx_sales_sold_at ON sales(sold_at);

-- ── Row Level Security (open for now) ───────────────────────
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on machines" ON machines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sales" ON sales FOR ALL USING (true) WITH CHECK (true);

-- ── Seed Data ──────────────────────────────────────────────
INSERT INTO machines (id, name, location, status) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'HQ Lobby Fridge', '123 Main St, Lobby', 'active'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Warehouse Break Room', '456 Industrial Blvd', 'active');

INSERT INTO inventory (machine_id, item_name, price, stock_count) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Organic Cold Brew', 4.99, 12),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Sparkling Lemonade', 3.49, 3),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Protein Bar', 2.99, 0),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Green Smoothie', 5.99, 8),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Turkey Wrap', 7.49, 2),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Coconut Water', 3.99, 15);

INSERT INTO sales (machine_id, item_name, quantity, total_price, payment_method, sold_at) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Organic Cold Brew', 1, 4.99, 'apple_pay', NOW() - INTERVAL '1 day'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Organic Cold Brew', 2, 9.98, 'card', NOW() - INTERVAL '2 days'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Sparkling Lemonade', 1, 3.49, 'crypto', NOW() - INTERVAL '3 days'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Protein Bar', 1, 2.99, 'card', NOW() - INTERVAL '5 days'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Green Smoothie', 1, 5.99, 'apple_pay', NOW() - INTERVAL '1 day'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Turkey Wrap', 1, 7.49, 'card', NOW() - INTERVAL '4 days'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Coconut Water', 3, 11.97, 'apple_pay', NOW() - INTERVAL '6 days'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Green Smoothie', 1, 5.99, 'crypto', NOW() - INTERVAL '7 days'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Organic Cold Brew', 1, 4.99, 'card', NOW() - INTERVAL '10 days'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Sparkling Lemonade', 1, 3.49, 'apple_pay', NOW() - INTERVAL '12 days');
