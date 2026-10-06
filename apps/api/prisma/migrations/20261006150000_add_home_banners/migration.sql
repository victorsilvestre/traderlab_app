CREATE TABLE "home_banners" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "image_path" VARCHAR(2048) NOT NULL,
    "destination_url" VARCHAR(2048),
    "alt_text" VARCHAR(500) NOT NULL,
    "status" "publication_status" NOT NULL DEFAULT 'DRAFT',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "home_banners_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "home_banners_destination_url_http_check"
      CHECK ("destination_url" IS NULL OR "destination_url" ~* '^https?://')
);

CREATE INDEX "home_banners_status_display_order_idx"
ON "home_banners"("status", "display_order");

ALTER TABLE "home_banners"
ADD CONSTRAINT "home_banners_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "user_profiles"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "home_banners"
ADD CONSTRAINT "home_banners_updated_by_id_fkey"
FOREIGN KEY ("updated_by_id") REFERENCES "user_profiles"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "home_banners"
  ("title", "image_path", "destination_url", "alt_text", "status", "display_order", "updated_at")
VALUES
  ('Conhecimento se constrói com consistência', '/banners/estudo.svg', NULL,
   'Ilustração de uma mesa de estudos e um gráfico de mercado.', 'PUBLISHED', 1, CURRENT_TIMESTAMP),
  ('Entenda o contexto antes de agir', '/banners/analise.svg', NULL,
   'Ilustração de anotações e linhas de gráfico para estudo.', 'PUBLISHED', 2, CURRENT_TIMESTAMP),
  ('Seu próximo passo começa aqui', '/banners/progresso.svg', NULL,
   'Ilustração de um percurso gradual de aprendizagem.', 'PUBLISHED', 3, CURRENT_TIMESTAMP);
