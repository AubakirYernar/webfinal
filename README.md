# webfinal

Todo Management System with Admin Panel

A comprehensive task management application with user authentication and administrative controls. Built using Node.js, Express, MongoDB, JWT, and EJS.

Features

User Features

Secure JWT-based registration and login.

Password reset functionality.

Profile management: update username/email, change password, upload profile images.

Todo operations: create, read, update, delete tasks, mark tasks as complete/incomplete.

Responsive task table view.

Admin Features

Dashboard: view all users, manage user roles (Admin/User), monitor system-wide todos.

User management: edit/delete accounts, reset passwords, view activity.

Content control: delete todos, export user data (CSV/JSON).

Getting Started

Prerequisites

Node.js v16+

MongoDB (local or Atlas cluster)

NPM/Yarn

Installation

Clone the repository:
git clone https://github.com/yourusername/todo-manager.git
cd todo-manager

Install dependencies:
npm install

Configure environment variables:

Copy .env.example to .env.

Update .env with your MongoDB URI, JWT secret, and port.

Running the Application
Start the server: npm start.
Access the app at http://localhost:3000.

System Architecture

Config: Database setup.

Controllers: Authentication, user, and todo logic.

Middlewares: JWT verification and admin role checks.

Models: MongoDB schemas for users and todos.

Routes: API endpoints for auth, users, and admin.

Views: EJS templates for frontend rendering.

Security Features

JWT authentication with token expiration.

Password hashing using BCrypt.

Role-based access control (Admin vs. User).

Input validation and sanitization.

Helmet middleware for HTTP headers.

Key Dependencies

Express (web framework).

Mongoose (MongoDB ODM).

JSON Web Tokens (authentication).

BCrypt (password hashing).

Multer (file uploads).

EJS (templating engine).
