-- =====================================================
-- Seed Admin User
-- Email: admin@mail.com | Password: 12345
-- =====================================================

INSERT IGNORE INTO `users` (`email`, `name`, `password`, `role`, `is_active`)
VALUES (
  'admin@mail.com',
  'Administrator',
  '$2a$12$IAfzlJAx/FjuFJ6GKvPjievcGS5v5CuPyslqNr2W/jn/UZE897UqG',
  'admin',
  TRUE
);
