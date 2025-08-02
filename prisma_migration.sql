-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."subdomains" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "theme_color" TEXT NOT NULL DEFAULT 'primary',
    "description" TEXT,
    "icon_emoji" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subdomains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "website" TEXT,
    "bio" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posts" (
    "id" UUID NOT NULL,
    "subdomain_id" BIGINT NOT NULL,
    "author_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "excerpt" TEXT,
    "featured_image_url" TEXT,
    "featured_image_alt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "meta_title" TEXT,
    "meta_description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comments" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "parent_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_users" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT,
    "full_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_sessions" (
    "id" UUID NOT NULL,
    "admin_user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subdomains_name_key" ON "public"."subdomains"("name");

-- CreateIndex
CREATE INDEX "posts_subdomain_id_idx" ON "public"."posts"("subdomain_id");

-- CreateIndex
CREATE INDEX "posts_status_idx" ON "public"."posts"("status");

-- CreateIndex
CREATE INDEX "posts_published_at_idx" ON "public"."posts"("published_at" DESC);

-- CreateIndex
CREATE INDEX "posts_slug_idx" ON "public"."posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "posts_subdomain_id_slug_key" ON "public"."posts"("subdomain_id", "slug");

-- CreateIndex
CREATE INDEX "comments_post_id_idx" ON "public"."comments"("post_id");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "public"."comments"("user_id");

-- CreateIndex
CREATE INDEX "comments_status_idx" ON "public"."comments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "public"."admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "public"."admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_token_key" ON "public"."admin_sessions"("token");

-- CreateIndex
CREATE INDEX "admin_sessions_token_idx" ON "public"."admin_sessions"("token");

-- CreateIndex
CREATE INDEX "admin_sessions_expires_at_idx" ON "public"."admin_sessions"("expires_at");

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_subdomain_id_fkey" FOREIGN KEY ("subdomain_id") REFERENCES "public"."subdomains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_sessions" ADD CONSTRAINT "admin_sessions_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

