WITH black_friday AS (
  INSERT INTO "notifications"
    ("title", "description", "link_url", "audience", "status", "published_at")
  VALUES
    ('A Black Friday TraderLab está chegando',
     'Estamos preparando uma condição especial para a Black Friday. Fique de olho nas próximas notificações para acompanhar as novidades.',
     NULL, 'GENERAL', 'PUBLISHED', CURRENT_TIMESTAMP)
  RETURNING "id"
)
INSERT INTO "notification_recipients" ("notification_id", "user_id")
SELECT black_friday."id", user_profiles."id"
FROM black_friday CROSS JOIN "user_profiles";
