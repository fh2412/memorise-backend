## Setting Up Your Local MySQL Database with Docker

This guide will walk you through the steps to get your MySQL database running locally using Docker. Make sure you have Git installed on your system.

**Step 1: Clone the Repository**

First, clone your Node.js backend repository from GitHub to your local machine using the following command in your terminal:

```bash
git clone <repository_url>
cd <repository_name>
```

**Step 2: Install Docker Desktop on Windows**

If you don't have Docker Desktop installed on your Windows machine, follow these steps:

1.  **Open your web browser** and navigate to the official Docker website: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2.  **Download Docker Desktop for Windows.**
3.  **Double-click the downloaded `.exe` file** to start the installation process.
4.  **Follow the on-screen instructions.** You might be asked to enable Hyper-V and/or WSL 2 features if they are not already enabled. Docker Desktop will guide you through these steps. It's generally recommended to use the WSL 2 backend for better performance on Windows.
5.  **Restart your computer** after the installation is complete.
6.  **Open Docker Desktop** from the Start menu to ensure it's running correctly. You should see the Docker icon in your system tray.

**Step 3: Navigate to the `db` Directory**

Once Docker Desktop is running, open your terminal and navigate to the `db` directory within your cloned repository:

```bash
cd db
```

**Step 4: Start the Docker Container**

The `docker-compose.yml` file in this directory defines how to build and run your MySQL container. To start the container, execute the following command:

```bash
docker-compose up -d
```

* `docker-compose up`: This command creates and starts the services defined in your `docker-compose.yml` file.
* `-d`: This flag runs the containers in detached mode (in the background), so your terminal remains free.

Docker will now:

1.  **Build the Docker image:** It will use the `Dockerfile` in the `db` directory as instructions. This Dockerfile is set up to:
    * Pull the official `mysql:8.0` image from Docker Hub.
    * Set the root password and the initial database name (`memorise_gc_db`).
    * Set the default user and password (note that the current `Dockerfile` has placeholders `...` for these; you'll likely need to update these or provide them via environment variables).
    * Copy your `dump.sql` file into the container's initialization directory (`/docker-entrypoint-initdb.d/`). MySQL will automatically execute any `.sql` files found in this directory when the container starts, creating your database schema and populating it with data.
2.  **Create and start a container** named `memorise_mysql` based on the built image.
3.  **Map the port:** It will map the host machine's port `3306` to the container's port `3306`, allowing you to connect to the MySQL database from your local machine.
4.  **Set environment variables:** It will use the environment variables defined in the `docker-compose.yml` file (like `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD`). **Important:** You'll need to make sure you have a `.env` file in the `db` directory (or have these environment variables set in your system) for `${DB_DATABASE}`, `${DB_USER}`, and `${DB_PASSWORD}` to be properly resolved. If you don't have a `.env` file, these variables might not be set correctly, and MySQL might use default values or fail to initialize as expected.

**Step 5: Verify the Container is Running**

You can check if the container is running by executing the following command in your terminal (still within the `db` directory or any other directory):

```bash
docker ps
```

You should see a container named `memorise_mysql` in the output with a status of "Up".

**Step 6: Connect to the MySQL Database**

Now you can connect to your running MySQL database using a MySQL client (like MySQL Workbench, DBeaver, or even the `mysql` command-line client). Use the following connection details:

* **Host:** `localhost` or `127.0.0.1`
* **Port:** `3306`
* **User:** The value specified for `MYSQL_USER` (either in your `Dockerfile` if you replace `...` or in your `.env` file if you have one and it's being used).
* **Password:** The value specified for `MYSQL_PASSWORD` (similarly, either in your `Dockerfile` or your `.env` file).
* **Database:** The value specified for `MYSQL_DATABASE` (which is `memorise_gc_db` in your `Dockerfile` and can also be set via the `DB_DATABASE` environment variable in your `.env` file).

**Step 7: Stop and Remove the Container (When Done)**

When you are finished working and want to stop the database container, navigate back to the `db` directory in your terminal and run:

```bash
docker-compose down
```

This command will stop and remove the container. The volume `db_data` will persist, so your data will be saved for the next time you run `docker-compose up`.

If you also want to remove the volume (and lose the data), you can run:

```bash
docker-compose down -v
```

**Important Considerations:**

* **Environment Variables:** Ensure you have a `.env` file in the `db` directory with the necessary database credentials (`DB_DATABASE`, `DB_USER`, `DB_PASSWORD`) or that these environment variables are set in your system. This is crucial for the `docker-compose.yml` to correctly configure your MySQL instance.
* **Security:** The default root password in the `Dockerfile` is set to `root`. For production environments, you should definitely change this to a more secure password and manage your database credentials carefully.
* **Data Persistence:** The `volumes` section in `docker-compose.yml` ensures that your database data is persisted in the `db_data` named volume on your host machine, even if you stop and remove the container.

By following these steps, developers cloning your repository will be able to easily set up a local MySQL database environment using Docker. Let me know if you have any other questions!
