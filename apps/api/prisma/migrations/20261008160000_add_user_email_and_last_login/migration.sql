ALTER TABLE "user_profiles"
ADD COLUMN "email" VARCHAR(254),
ADD COLUMN "last_login_at" TIMESTAMPTZ(6);

UPDATE "user_profiles" AS profile
SET
  "email" = LOWER(identity."email"),
  "last_login_at" = identity."last_sign_in_at"
FROM auth.users AS identity
WHERE profile."id" = identity."id";
