# Sistema de Gestión de Vacunación

Este proyecto es una aplicación web para gestionar citas de vacunación para tutores y sus hijos. Consiste en un frontend de Next.js y una API de backend con Express y SQL Server.

## Estructura del Proyecto

```
/
├── api/         # Código del backend (Express.js)
├── database/    # Scripts de la base de datos (SQL)
└── frontend/    # Código del frontend (Next.js)
```

## Configuración del Entorno

Siga estos pasos para configurar y ejecutar el proyecto localmente.

### 1. Requisitos Previos

- Node.js (v18 o superior)
- npm
- Acceso a la base de datos SQL de Azure

### 2. Configuración del Backend

1.  Navegue al directorio `api`.
2.  Cree un archivo `.env` basado en `.env.example` y complete los detalles de conexión de su base de datos.
3.  Instale las dependencias: `npm install`
4.  Inicie el servidor: `node index.js` (se ejecutará en el puerto 3001)

### 3. Configuración del Frontend

1.  Navegue al directorio `frontend`.
2.  Cree un archivo `.env.local` basado en `.env.local.example`.
3.  Instale las dependencias: `npm install`
4.  Inicie el servidor de desarrollo: `npm run dev` (se ejecutará en el puerto 3003)

---

## ⚠️ Zonas de Código Protegido - ¡NO MODIFICAR! ⚠️

Para evitar romper la funcionalidad principal de autenticación y gestión de citas, **NO MODIFIQUE** los siguientes archivos o endpoints. Estos componentes son estables y funcionan correctamente.

### Backend (Directorio `api`)

-   **`api/index.js`**: 
    -   **Endpoint de Login (`/api/auth/login`)**: La lógica de autenticación es crítica. No la altere.
    -   **Endpoint de Citas (`/api/appointments`)**: La obtención de citas basada en roles es compleja y está funcionando. No cambie la lógica.
    -   **Middleware `authenticateToken` / `verifyToken`**: Esencial para la seguridad de la API.

### Base de Datos (Directorio `database`)

-   **`database/programmability/usp_LoginUsuario.sql`**: El procedimiento de login es fundamental.
-   **`database/programmability/usp_GetAllAppointments.sql`**: Este procedimiento es el núcleo de la visualización de citas. Cambiarlo romperá el dashboard.

### Frontend (Directorio `frontend`)

-   **`frontend/app/login/page.tsx`**: La página de login y su lógica de envío son estables.
-   **`frontend/context/auth-context.tsx`**: El contexto de autenticación gestiona el estado del usuario en toda la aplicación. Los cambios aquí tendrán efectos generalizados.
-   **`frontend/hooks/use-api.ts`**: Este hook gestiona todas las llamadas a la API autenticadas. Modificarlo afectará a todas las solicitudes de datos.
-   **`frontend/app/dashboard/page.tsx`**: La lógica para obtener y mostrar citas ya es funcional. Concéntrese en agregar nuevas funcionalidades en lugar de alterar las existentes.

---

## ✅ Tarea Actual: Registro de Niños

Su tarea es implementar la funcionalidad para registrar un nuevo niño (`Nino`) bajo la tutela de un usuario.

### Dónde Empezar

1.  **Frontend**: Comience en `frontend/app/children/new/page.tsx` (es posible que necesite crear esta ruta y página).
2.  **Backend**: Deberá crear un nuevo endpoint en `api/index.js`, por ejemplo, `POST /api/children`, que utilice el procedimiento almacenado `usp_RegisterNino`.
3.  **Base de Datos**: El procedimiento `usp_RegisterNino.sql` ya existe y está listo para ser utilizado. Puede encontrarlo en `database/programmability/`.

Si tiene alguna pregunta, no dude en consultar antes de realizar cambios importantes.

    *   Create a `.env` file in the `/api` directory by copying the example file:
        ```bash
        cp .env.example .env
        ```
    *   Open the `.env` file and update the necessary variables (e.g., database connection details, API keys, etc.). Refer to `api/.env.example` for the required variables and their purpose.

4.  **Run the API:**
    ```bash
    npm start
    # or
    # yarn start
    # If you have a dev script in package.json (e.g., using nodemon):
    # npm run dev
    ```
    The API should now be running. Check your project's configuration or console output for the specific port (e.g., `http://localhost:3000`).

### 3. Database Setup

The project uses a PostgreSQL database. The database-related files are located in the `/database` directory.

1.  **Ensure PostgreSQL is installed and running.**
2.  **Create the database and user:**
    *   You will need to create a new database and a user with appropriate permissions. The exact commands might vary slightly based on your PostgreSQL setup and client.
    *   Example using `psql` (you might need `sudo -u postgres psql` on Linux/macOS):
        ```sql
        CREATE DATABASE vaccination_system_db; -- Or your preferred DB name
        CREATE USER your_db_user WITH ENCRYPTED PASSWORD 'your_strong_password';
        GRANT ALL PRIVILEGES ON DATABASE vaccination_system_db TO your_db_user;
        ALTER DATABASE vaccination_system_db OWNER TO your_db_user;
        ```
    *   Make sure to replace `vaccination_system_db`, `your_db_user`, and `your_strong_password` with your actual desired values.

3.  **Run schema and initial data scripts:**
    *   The `/database` directory contains schema files (e.g., `schema.sql`) and potentially migration scripts or stored procedures (like `usp_GetActiveVaccineLots.sql`, `usp_GetAppointmentsByNino.sql`).
    *   Apply the schema to your newly created database. You can use a tool like `psql` or a GUI client (e.g., pgAdmin, DBeaver).
        ```bash
        # Example using psql, run from the root of the project directory
        psql -U your_db_user -d vaccination_system_db -f ./database/schema.sql 
        psql -U your_db_user -d vaccination_system_db -f ./database/programmability/usp_GetActiveVaccineLots.sql
        psql -U your_db_user -d vaccination_system_db -f ./database/programmability/usp_GetAppointmentsByNino.sql
        # Add other .sql files as needed
        ```
    *   *(Note: If the project later adopts a migration tool like Knex.js, Sequelize, or TypeORM, these instructions for database setup will need to be updated to reflect the use of that tool's commands.)*

4.  **Update API's `.env` file:**
    *   Ensure the database connection details in the `/api/.env` file (e.g., `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`) match your database setup from step 3.2.

### 4. Frontend Setup

The frontend is a ReactJS application intended to be located in the `/frontend` directory.

*(Instructions for setting up the frontend will be added here once the frontend development starts. This will typically involve navigating to the `/frontend` directory, running `npm install` (or `yarn install`), and then `npm start` (or `yarn start`). Environment variables for the frontend might also be required.)*

### Running the Full Application

1.  Ensure your PostgreSQL database server is running and accessible.
2.  Start the backend API (e.g., from the `/api` directory: `npm start`).
3.  (Once developed) Start the frontend application (e.g., from the `/frontend` directory: `npm start`).

After these steps, you should be able to access the application in your web browser. The frontend will typically run on a different port than the API (e.g., `http://localhost:3001` if the API is on `http://localhost:3000`). Refer to the specific project configurations for exact URLs and ports.
