BEGIN;

-- ----------------------------
-- 2) Recreate USERS
-- ----------------------------
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes (unique already creates indexes, but these are common access paths)
CREATE INDEX users_role_idx ON users(role);
CREATE INDEX users_is_blocked_idx ON users(is_blocked);

-- ----------------------------
-- 3) LISTINGS (items for sale)
-- ----------------------------
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL CHECK (price_cents >= 0),
  quantity_available INT NOT NULL CHECK (quantity_available >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX listings_seller_id_idx ON listings(seller_id);
CREATE INDEX listings_status_idx ON listings(status);

-- ----------------------------
-- 4) CARTS (one active cart per user is typical)
-- ----------------------------
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX carts_user_id_idx ON carts(user_id);
CREATE INDEX carts_status_idx ON carts(status);

-- Optional: enforce 1 active cart per user
CREATE UNIQUE INDEX carts_one_active_per_user
ON carts(user_id)
WHERE status = 'active';

-- ----------------------------
-- 5) CART_ITEMS (join table: carts <-> listings)
-- ----------------------------
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX cart_items_cart_id_idx ON cart_items(cart_id);
CREATE INDEX cart_items_listing_id_idx ON cart_items(listing_id);

-- Optional: prevent duplicate listing rows in the same cart
CREATE UNIQUE INDEX cart_items_unique_listing_per_cart
ON cart_items(cart_id, listing_id);

-- ----------------------------
-- 6) ORDERS
-- ----------------------------
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  total_cents INT NOT NULL CHECK (total_cents >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX orders_buyer_id_idx ON orders(buyer_id);
CREATE INDEX orders_status_idx ON orders(status);

-- ----------------------------
-- 7) ORDER_ITEMS (line items)
-- ----------------------------
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  seller_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_cents_at_purchase INT NOT NULL CHECK (price_cents_at_purchase >= 0)
);

CREATE INDEX order_items_order_id_idx ON order_items(order_id);
CREATE INDEX order_items_listing_id_idx ON order_items(listing_id);
CREATE INDEX order_items_seller_id_idx ON order_items(seller_id);

-- ----------------------------
-- 8) PAYMENTS (optional but recommended)
-- ----------------------------
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'succeeded', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX payments_order_id_idx ON payments(order_id);
CREATE INDEX payments_status_idx ON payments(status);

COMMIT;

