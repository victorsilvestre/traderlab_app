ALTER TABLE "home_banners"
  ADD COLUMN "eyebrow_text" VARCHAR(180);

UPDATE "home_banners"
SET "internal_name" = 'Aprenda com método',
    "description" = 'Um passo de cada vez, no seu ritmo.',
    "eyebrow_text" = 'Aprenda com método',
    "overlay_text" = 'Conhecimento se constrói com consistência.',
    "image_path" = '/banners/estudo.svg',
    "alt_text" = 'Ilustração de uma mesa de estudos e um gráfico de mercado.'
WHERE "id" = 1;

UPDATE "home_banners"
SET "internal_name" = 'Estude com clareza',
    "description" = 'Conteúdo para apoiar decisões mais conscientes.',
    "eyebrow_text" = 'Estude com clareza',
    "overlay_text" = 'Entenda o contexto antes de agir.',
    "image_path" = '/banners/analise.svg',
    "alt_text" = 'Ilustração de anotações e linhas de gráfico para estudo.'
WHERE "id" = 2;

UPDATE "home_banners"
SET "internal_name" = 'Seu aprendizado',
    "description" = 'Retome seus estudos sempre que quiser.',
    "eyebrow_text" = 'Seu aprendizado',
    "overlay_text" = 'Seu próximo passo começa aqui.',
    "image_path" = '/banners/progresso.svg',
    "alt_text" = 'Ilustração de um percurso gradual de aprendizagem.'
WHERE "id" = 3;
