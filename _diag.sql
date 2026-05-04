SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND (table_name ILIKE '%histor%' OR table_name='_prisma_migrations') ORDER BY table_name;
