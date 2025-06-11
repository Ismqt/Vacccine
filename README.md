# Vaccination System

This project is a comprehensive system for registering, tracking, controlling, and evaluating the vaccination scheme for children up to 14 years old.

## Project Overview

The goal is to ensure nominal and individualized registration, monitoring, control, and evaluation of the vaccination schedule for all children up to 14 years of age. This will enable timely public health decisions, logistics of supplies, and preventive campaigns.

## Tech Stack

*   **Backend**: Node.js 20 LTS
*   **Frontend**: ReactJS
*   **UI Library**: NextUI or Bootstrap (To be decided)
*   **Database**: PostgreSQL (Chosen)
*   **Maps (Optional)**: React Leaflet

## Architecture

The system will follow a 3-tier architecture:
1.  Database Layer
2.  Backend Layer (API)
3.  Frontend Layer (User Interface)

## Project Structure

*   [README.md](cci:7://file:///c:/Users/ismae/CascadeProjects/VaccinationSystem/README.md:0:0-0:0): This file.
*   `/database`: Will contain database schema (e.g., [schema.sql](cci:7://file:///C:/Users/ismae/CascadeProjects/VaccinationSystem/database/schema.sql:0:0-0:0)) and migration scripts.
*   `/backend`: Will contain the Node.js backend application.
*   `/frontend`: Will contain the ReactJS frontend application.

## Core Features

1.  **Child Records Management**:
    *   Full name, ID, DOB, gender, country of birth.
    *   Parent/guardian details (name, ID, contact, address).
    *   Residential address (for optional georeferencing).
    *   Assigned health center.
2.  **Vaccination Center Management**:
    *   Name, short name, address, phone, director, website.
3.  **Vaccination History**:
    *   Vaccine applied (name, manufacturer, lot, type).
    *   Date of application, dose, age at vaccination.
    *   Responsible health personnel, optional digital signature.
4.  **Alerts and Follow-up Module**:
    *   Automatic reminders for upcoming doses.
    *   Alerts for incomplete or overdue schedules.
    *   Electronic appointment generation.
5.  **Reports and Statistics**:
    *   Coverage by age group, vaccine, or geographic area.
    *   Coverage maps with risk indicators.
    *   Lists of children with complete/incomplete schedules.
    *   Data export (Excel, CSV, PDF).
6.  **Security and Auditing**:
    *   User access logs.
    *   Permission controls (doctor, nurse, digitizer, supervisor).
    *   Encryption of sensitive data.
    *   Record modification log.
7.  **Other Functional Features**:
    *   Compatibility with national vaccination calendars.
    *   Automatic age/vaccine validation.
    *   Integration with vaccine management systems (logistics).
    *   Digital or physical vaccination card issuance.
    *   Offline registration with subsequent synchronization.

## Setup and Installation

Follow these steps to set up and run the project locally.

### Prerequisites

*   Node.js (Version 20 LTS recommended, as per project details)
*   npm (comes with Node.js) or yarn
*   PostgreSQL (or your chosen SQL database client)
*   Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd VaccinationSystem
```
Replace `<repository-url>` with the actual URL of your Git repository.

### 2. Backend Setup (API)

The backend is a Node.js application located in the `/api` directory.

1.  **Navigate to the API directory:**
    ```bash
    cd api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up environment variables:**
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
