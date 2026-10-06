ALTER TABLE "notifications"
ADD COLUMN "updated_by_id" UUID,
ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_updated_by_id_fkey"
FOREIGN KEY ("updated_by_id") REFERENCES "user_profiles"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
