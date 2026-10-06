CREATE TYPE "notification_audience" AS ENUM ('GENERAL', 'COURSE');

CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" VARCHAR(3000) NOT NULL,
    "link_url" VARCHAR(2048),
    "audience" "notification_audience" NOT NULL,
    "course_id" INTEGER,
    "status" "publication_status" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ(6),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_audience_course_check"
      CHECK (("audience" = 'COURSE' AND "course_id" IS NOT NULL) OR
             ("audience" = 'GENERAL' AND "course_id" IS NULL)),
    CONSTRAINT "notifications_link_url_check"
      CHECK ("link_url" IS NULL OR "link_url" ~* '^https?://' OR
             ("link_url" LIKE '/%' AND "link_url" NOT LIKE '//%'))
);

CREATE TABLE "notification_recipients" (
    "notification_id" INTEGER NOT NULL,
    "user_id" UUID NOT NULL,
    "delivered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMPTZ(6),

    CONSTRAINT "notification_recipients_pkey"
      PRIMARY KEY ("notification_id", "user_id")
);

CREATE INDEX "notifications_audience_course_status_published_at_idx"
ON "notifications"("audience", "course_id", "status", "published_at");

CREATE INDEX "notification_recipients_user_id_read_at_delivered_at_idx"
ON "notification_recipients"("user_id", "read_at", "delivered_at");

ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_course_id_fkey"
FOREIGN KEY ("course_id") REFERENCES "courses"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "user_profiles"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notification_recipients"
ADD CONSTRAINT "notification_recipients_notification_id_fkey"
FOREIGN KEY ("notification_id") REFERENCES "notifications"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notification_recipients"
ADD CONSTRAINT "notification_recipients_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

WITH first_general AS (
  INSERT INTO "notifications"
    ("title", "description", "link_url", "audience", "status", "published_at")
  VALUES
    ('Boas-vindas ao TraderLab',
     'Seu espaço de estudos está pronto. Explore seus cursos e comece pelo próximo conteúdo.',
     '/home', 'GENERAL', 'PUBLISHED', CURRENT_TIMESTAMP)
  RETURNING "id"
)
INSERT INTO "notification_recipients" ("notification_id", "user_id")
SELECT first_general."id", user_profiles."id"
FROM first_general CROSS JOIN "user_profiles";

WITH second_general AS (
  INSERT INTO "notifications"
    ("title", "description", "link_url", "audience", "status", "published_at")
  VALUES
    ('Uma dica para manter o ritmo',
     'Reserve alguns minutos para estudar com frequência. Seu progresso fica salvo para você continuar depois.',
     NULL, 'GENERAL', 'PUBLISHED', CURRENT_TIMESTAMP - INTERVAL '1 minute')
  RETURNING "id"
)
INSERT INTO "notification_recipients" ("notification_id", "user_id")
SELECT second_general."id", user_profiles."id"
FROM second_general CROSS JOIN "user_profiles";

WITH target_course AS (
  SELECT courses."id", courses."title"
  FROM "courses" AS courses
  JOIN "enrollments" AS enrollments
    ON enrollments."course_id" = courses."id"
   AND enrollments."status" = 'ACTIVE'
  WHERE courses."status" = 'PUBLISHED'
  GROUP BY courses."id", courses."title", courses."created_at"
  ORDER BY courses."created_at" ASC, courses."id" ASC
  LIMIT 1
),
course_notification AS (
  INSERT INTO "notifications"
    ("title", "description", "link_url", "audience", "course_id", "status", "published_at")
  SELECT
    'Continue seus estudos no curso',
    'Há novos conteúdos disponíveis para você. Acesse o curso e escolha sua próxima aula.',
    '/courses/' || target_course."id"::text,
    'COURSE', target_course."id", 'PUBLISHED', CURRENT_TIMESTAMP
  FROM target_course
  RETURNING "id", "course_id"
)
INSERT INTO "notification_recipients" ("notification_id", "user_id")
SELECT course_notification."id", enrollments."student_id"
FROM course_notification
JOIN "enrollments"
  ON enrollments."course_id" = course_notification."course_id"
 AND enrollments."status" = 'ACTIVE';
