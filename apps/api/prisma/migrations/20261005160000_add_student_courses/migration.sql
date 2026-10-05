CREATE TYPE "publication_status" AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE "course_content_kind" AS ENUM ('LESSON', 'MATERIAL');
CREATE TYPE "enrollment_status" AS ENUM ('ACTIVE', 'REVOKED');
CREATE TYPE "enrollment_source" AS ENUM ('PURCHASE', 'INVITATION', 'MANUAL');

CREATE TABLE "courses" (
    "id" VARCHAR(30) NOT NULL,
    "created_by_id" UUID NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT NOT NULL,
    "cover_image_url" VARCHAR(2048),
    "status" "publication_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "course_modules" (
    "id" VARCHAR(30) NOT NULL,
    "course_id" VARCHAR(30) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image_url" VARCHAR(2048),
    "position" INTEGER NOT NULL DEFAULT 0,
    "status" "publication_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "course_contents" (
    "id" VARCHAR(30) NOT NULL,
    "module_id" VARCHAR(30) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "kind" "course_content_kind" NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "resource_url" VARCHAR(2048),
    "position" INTEGER NOT NULL DEFAULT 0,
    "status" "publication_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "course_contents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enrollments" (
    "id" VARCHAR(30) NOT NULL,
    "student_id" UUID NOT NULL,
    "course_id" VARCHAR(30) NOT NULL,
    "source" "enrollment_source" NOT NULL,
    "status" "enrollment_status" NOT NULL DEFAULT 'ACTIVE',
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_progress" (
    "id" VARCHAR(30) NOT NULL,
    "student_id" UUID NOT NULL,
    "content_id" VARCHAR(30) NOT NULL,
    "last_accessed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "content_progress_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "courses_status_published_at_idx" ON "courses"("status", "published_at");
CREATE INDEX "courses_created_by_id_idx" ON "courses"("created_by_id");
CREATE INDEX "course_modules_course_id_status_position_idx" ON "course_modules"("course_id", "status", "position");
CREATE INDEX "course_contents_module_id_status_position_idx" ON "course_contents"("module_id", "status", "position");
CREATE UNIQUE INDEX "enrollments_student_id_course_id_key" ON "enrollments"("student_id", "course_id");
CREATE INDEX "enrollments_course_id_status_idx" ON "enrollments"("course_id", "status");
CREATE UNIQUE INDEX "content_progress_student_id_content_id_key" ON "content_progress"("student_id", "content_id");
CREATE INDEX "content_progress_student_id_last_accessed_at_idx" ON "content_progress"("student_id", "last_accessed_at");

ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_contents" ADD CONSTRAINT "course_contents_module_id_fkey"
    FOREIGN KEY ("module_id") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_progress" ADD CONSTRAINT "content_progress_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_progress" ADD CONSTRAINT "content_progress_content_id_fkey"
    FOREIGN KEY ("content_id") REFERENCES "course_contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
