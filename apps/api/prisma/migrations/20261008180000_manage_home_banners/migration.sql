ALTER TABLE "home_banners"
  ADD COLUMN "internal_name" VARCHAR(180),
  ADD COLUMN "description" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "overlay_text" VARCHAR(500);

UPDATE "home_banners"
SET "internal_name" = "title",
    "overlay_text" = "title";

ALTER TABLE "home_banners"
  ALTER COLUMN "internal_name" SET NOT NULL;
