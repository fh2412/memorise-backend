FROM mysql:8.0

# Set MySQL root password and database name
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=memorise_gc_db
ENV MYSQL_USER=...
ENV MYSQL_PASSWORD=...

# Copy the SQL dump into the Docker container's init directory
COPY dump.sql /docker-entrypoint-initdb.d/
