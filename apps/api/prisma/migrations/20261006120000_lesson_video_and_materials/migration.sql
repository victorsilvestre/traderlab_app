ALTER TABLE "course_contents"
ADD COLUMN "video_url" VARCHAR(2048);

UPDATE "course_contents"
SET "video_url" = "resource_url"
WHERE "kind" = 'LESSON'
  AND "resource_url" ~* '^https?://(www\.)?(m\.)?(youtube\.com/(watch\?v=|embed/)|youtu\.be/)[A-Za-z0-9_-]{11}([?&].*)?$'
  AND "resource_url" !~* '([?&]list=)';

CREATE TABLE "course_materials" (
    "id" SERIAL NOT NULL,
    "content_id" INTEGER NOT NULL,
    "name" VARCHAR(240) NOT NULL,
    "storage_path" VARCHAR(1024) NOT NULL,
    "mime_type" VARCHAR(160) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_materials_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "course_materials_content_id_position_idx"
ON "course_materials"("content_id", "position");

ALTER TABLE "course_materials"
ADD CONSTRAINT "course_materials_content_id_fkey"
FOREIGN KEY ("content_id") REFERENCES "course_contents"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
