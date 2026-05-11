-- Run this in your Supabase SQL Editor before starting the app.
-- Dashboard → SQL Editor → New query → paste this → Run

create table trips (
  id           uuid        primary key default gen_random_uuid(),
  feature_code text        unique not null,   -- e.g. sggcd "11680"
  feature_name text        not null,          -- e.g. "강남구"
  level        text        not null,          -- "emd" | "sgg" | "sido"
  color        text        not null,          -- hex e.g. "#c0392b"
  note         text,
  visited_at   date,
  created_at   timestamptz default now()
);
