FROM mysql:8.0

# Set environment variables (will be overridden by docker-compose)
ENV MYSQL_DATABASE=memorise
ENV MYSQL_USER=memorise_user
ENV MYSQL_PASSWORD=dev_password
ENV MYSQL_ROOT_PASSWORD=root_password

# Copy the database dump
COPY dump.sql /docker-entrypoint-initdb.d/

# MySQL automatically executes .sql files in /docker-entrypoint-initdb.d/
# on first container startup

# Expose MySQL port
EXPOSE 3306
