CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT,
  "solde" FLOAT NOT NULL DEFAULT 0,
  "points" INT NOT NULL DEFAULT 0,
  "pseudo" TEXT,
  "email" TEXT,
  "hashed_pass" TEXT,
  "salt" TEXT,
  "date_of_birth" DATE,
  "image" TEXT,
  "created_at" DATE,
  "last_logged" DATE,
  "active" BOOLEAN NOT NULL DEFAULT true
);