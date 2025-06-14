# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-14

This release marks the initial stable version of the Vaccination System, featuring a complete authentication flow, a functional appointment dashboard, and a project structure prepared for team collaboration.

### ✨ Added

-   **Full-Stack User Authentication**: Secure login system using JWT and bcrypt.
-   **Role-Based Access Control (RBAC)**: Backend middleware and dynamic frontend UI based on user roles.
-   **Appointment Dashboard**: A central dashboard for users to view their upcoming and past vaccination appointments.
-   **Vaccination Centers Endpoint**: New `/api/vaccination-centers` endpoint to fetch a list of all centers.
-   **Project Documentation**: 
    -   A comprehensive `README.md` with setup instructions and a "Protected Code" guide for new developers.
    -   Example environment files (`.env.example`) for both frontend and backend to streamline setup.
-   **Git Repository**: Initialized a Git repository and pushed the project to GitHub for version control and collaboration.

### 🐛 Fixed

-   **Appointment Data Logic**: Overhauled the `usp_GetAllAppointments` stored procedure to correctly fetch appointments based on user roles (admins, medics, and tutors), fixing complex table join and column name issues.
-   **Frontend Date Handling**: Resolved a critical "Invalid time value" crash on the dashboard by implementing a helper function to correctly combine and format date and time values from the API.
-   **API Data Mismatch**: Corrected column name aliases in the API response (`Fecha`, `Hora`) to match frontend expectations, fixing a "Cannot read properties of undefined" error.
-   **React Hydration Errors**: Suppressed non-critical React hydration warnings caused by browser extensions by adding `suppressHydrationWarning` to the main layout.
-   **Server Port Conflicts**: Implemented robust server restart commands to gracefully stop existing processes and prevent port conflicts between the frontend and backend.
-   **GitHub Push Failure**: Resolved an SSH "Host key verification failed" error by switching the Git remote URL to HTTPS, enabling a successful push to the remote repository.

### 🔄 Changed

-   **Database Schema**: Updated multiple stored procedures to align with the definitive database schema, ensuring data consistency.
-   **Code Organization**: Refactored frontend components to improve date handling and reusability.
