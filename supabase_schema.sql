-- Music Studio: Supabase/PostgreSQL schema
-- The server also creates these tables automatically on first start.
-- Run this file in Supabase SQL Editor if you want to create them before deploying.

CREATE TABLE IF NOT EXISTS users (id BIGSERIAL PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS studios (id BIGSERIAL PRIMARY KEY,name TEXT NOT NULL,description TEXT,price_per_hour NUMERIC(10,2) NOT NULL,image_url TEXT,equipment TEXT,status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','maintenance')),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS bookings (id BIGSERIAL PRIMARY KEY,user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,studio_id BIGINT NOT NULL REFERENCES studios(id) ON DELETE CASCADE,date TEXT NOT NULL,start_time TEXT NOT NULL,end_time TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','completed','cancelled')),total_price NUMERIC(10,2) NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notifications (id BIGSERIAL PRIMARY KEY,user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,type TEXT NOT NULL DEFAULT 'alert',title TEXT NOT NULL,message TEXT NOT NULL,read BOOLEAN NOT NULL DEFAULT FALSE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS payments (id BIGSERIAL PRIMARY KEY,booking_id BIGINT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,method TEXT NOT NULL,amount NUMERIC(10,2) NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','rejected')),proof_url TEXT,note TEXT,paid_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
