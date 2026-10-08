FROM postgres:15-alpine

# Copia las migraciones a la imagen para evitar bind mounts de Windows y
# compartir las carpetas del host en Docker Desktop.
COPY supabase/migrations/*.sql /docker-entrypoint-initdb.d/
