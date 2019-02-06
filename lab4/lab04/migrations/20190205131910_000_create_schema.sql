-- CMPT 315 (Winter 2019)
-- Lab #4: Middleware and Encoding/Decoding
-- Author: Nicholas M. Boers
-- 
-- This file implements the creation of the schema.

-- +goose Up

CREATE TABLE assessment (
  account integer PRIMARY KEY,
  address text,
  value integer NOT NULL
);

-- +goose Down

DROP TABLE assessment;
