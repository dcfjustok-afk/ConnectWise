-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."SharePermission" AS ENUM ('view', 'edit');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" BIGSERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."canvases" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "user_name" TEXT,
    "title" TEXT,
    "description" TEXT,
    "nodes" JSONB NOT NULL DEFAULT '[]',
    "edges" JSONB NOT NULL DEFAULT '[]',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "thumbnail_file_name" TEXT,

    CONSTRAINT "canvases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."canvas_shares" (
    "id" BIGSERIAL NOT NULL,
    "canvas_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "permission" "public"."SharePermission" NOT NULL DEFAULT 'view',

    CONSTRAINT "canvas_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "canvases_user_id_idx" ON "public"."canvases"("user_id");

-- CreateIndex
CREATE INDEX "canvas_shares_user_id_idx" ON "public"."canvas_shares"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "canvas_shares_canvas_id_user_id_key" ON "public"."canvas_shares"("canvas_id", "user_id");

-- AddForeignKey
ALTER TABLE "public"."canvases" ADD CONSTRAINT "canvases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."canvas_shares" ADD CONSTRAINT "canvas_shares_canvas_id_fkey" FOREIGN KEY ("canvas_id") REFERENCES "public"."canvases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."canvas_shares" ADD CONSTRAINT "canvas_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
