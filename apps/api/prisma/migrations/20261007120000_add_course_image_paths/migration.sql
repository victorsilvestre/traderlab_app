ALTER TABLE "courses"
ADD COLUMN "cover_image_path" VARCHAR(512);

ALTER TABLE "course_modules"
ADD COLUMN "image_path" VARCHAR(512);

ALTER TABLE "course_contents"
ADD COLUMN "image_path" VARCHAR(512);
