// Las pruebas nunca utilizan las credenciales ni la base real de un equipo.
process.env.NODE_ENV = 'test';
process.env.APP_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://prueba:prueba@localhost:5432/pruebas';
process.env.DIRECT_URL = 'postgresql://prueba:prueba@localhost:5432/pruebas';
process.env.CORS_ORIGINS = 'http://localhost:3001';
process.env.AUTH_JWT_SECRET = 'clave-exclusiva-de-pruebas-'.repeat(4);
