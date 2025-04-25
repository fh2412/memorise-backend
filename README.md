# memorise backend

This is the backend API for the MemoriseNs application, built using Node.js.

## Project Structure

The project has the following key directories:

```

.
├── db/             \# Contains database-related files
│   ├── Dockerfile  \# Dockerfile for setting up a local MySQL database
│   └── dump.sql    \# MySQL database dump for initial setup
├── components/     \# Contains the main application source code
├── config/         \# Contains configurations from the .env file
│   ├── db.js       \# is where the database accesss is configured
│   └── firebase.js \# is where the fireBase access is configured
├── middleware/     \# Contains middleware like validation; ErrorHandling and auth
├── .env.example    \# Example environment variables file
├── Dockerfile      \# Contains the Dockerfile for the Cloud Run push
├── firebase.json
├── index.js        \# Contains the Code for the Program launch
├── package.json
├── package-lock.json
└── README.md

````

## Local Development Setup

Comming soon!: For local development, we provide a Docker setup to easily run a MySQL database populated with the initial data.

### Prerequisites

* **Docker** and **Docker Compose** installed on your system. You can find installation instructions for your operating system on the official Docker website: [https://docs.docker.com/](https://docs.docker.com/)

### Setting up the Database

1.  Navigate to the `db` directory in the project root:
    ```bash
    cd db
    ```
2.  Build and run the Docker container using Docker Compose:
    ```bash
    docker-compose up -d
    ```
    This command will build an image based on the `Dockerfile` and start a container named (by default, based on the `docker-compose.yml` file, which is implicitly used). The container will host a MySQL database initialized with the data from `dump.sql`.

### Configuring the Backend

1.  Navigate back to the root of the project.
2.  Create a `.env` file in the root directory based on the `.env.example` file.
3.  Update the `.env` file with the necessary environment variables, including the database connection details. These details should match the configuration in the `db/Dockerfile` (e.g., host, port, username, password, database name).

### Installing Dependencies

Run the following command in the project root to install the backend dependencies:

```bash
npm install
````

### Running the Development Server

Start the backend development server using the following command:

```bash
node index.js
```

## API Documentation
The Link to the API Documentation will be populated once the documentation is done.
[Link to your API documentation (e.g., Swagger UI, Postman Collection)](https://www.google.com/search?q=YOUR_API_DOCUMENTATION_LINK_HERE)

## Contributing to the Project

We welcome contributions from the community\! Please follow these guidelines:

### Recommended Branching Structure

We are adopting a branching strategy based on the common Gitflow workflow:

  * **`main`**: This branch contains the production-ready code.
  * **`dev`**: This is the integration branch for ongoing development. New features and bug fixes should be merged into this branch.
  * **`feature/<your-feature-name>`**: For each new feature you are working on, create a dedicated branch branching off from `dev`. Use a descriptive name for your feature.
  * **`bugfix/<issue-number>-short-description`**: For bug fixes, create a dedicated branch branching off from `dev`. Include the issue number (if applicable) and a short description of the fix.

### Contribution Workflow

1.  **Fork the repository** on GitHub.
2.  **Clone your forked repository** to your local machine:
    ```bash
    git clone [https://github.com/](https://github.com/)<your-github-username>/MemoriseNs-Backend.git
    cd MemoriseNs-Backend
    ```
3.  **Create a new branch** for your feature or bug fix, branching off from the `dev` branch:
    ```bash
    git checkout dev
    git checkout -b feature/<your-feature-name>
    # or
    git checkout -b bugfix/<issue-number>-short-description>
    ```
4.  **Make your changes**, adhering to the project's coding standards and best practices.
5.  **Commit your changes** with clear and concise commit messages, following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
6.  **Push your branch** to your forked repository on GitHub:
    ```bash
    git push origin <your-feature-branch-name>
    ```
7.  **Create a Pull Request (PR)** to the `dev` branch of the main repository.
      * Provide a clear and descriptive title for your PR.
      * Explain the purpose of your changes and any relevant context.
      * Reference any related issues.
8.  **Code Review**: Your PR will be reviewed by other contributors. Be prepared to address any feedback and make necessary changes.
9.  **Merging**: Once your PR is approved, it will be merged into the `dev` branch.

### Important Notes

  * **Keep your branches up-to-date**: Before starting new work, always pull the latest changes from the `dev` branch:
    ```bash
    git checkout dev
    git pull origin dev
    ```
    And if you've been working on a feature branch for a while, rebase it onto the latest `dev`:
    ```bash
    git checkout <your-feature-branch-name>
    git rebase dev
    ```
  * **Test your changes thoroughly**: Ensure your contributions do not introduce regressions and include relevant unit and integration tests.
  * **Communicate**: If you have any questions or need clarification, feel free to open an issue or reach out to the project maintainers.

Thank you for your contributions\!
