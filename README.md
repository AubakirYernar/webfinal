# Task Management System

A Node.js web application for user authentication, task management, and admin panel functionality using MongoDB and JWT authentication.

## Features

- **User Authentication**: 
  - Registration & Login with JWT
  - Password hashing using bcrypt
  - Session management with cookies

- **Task Management**:
  - Create/Read/Update/Delete todos
  - Mark tasks as complete/incomplete
  - User-specific task lists

- **Admin Panel**:
  - View all users and their tasks
  - Modify user details
  - Delete users/tasks
  - Admin access control

## Technologies

- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT
- Templating: EJS
- File Upload: Multer

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account or local MongoDB
- Basic terminal knowledge

### Installation
1. Clone repository:
``bash
git clone https://github.com/yourusername/task-management-system.git
cd task-management-system

2. npm install

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000

3. Access in browser: http://localhost:3000

# API Documentation
- Authentication
Endpoint  	Method	Description       	Request Body
/register 	POST	  Create new user	    {username, email, password}
/login	    POST	  User login	        {username, password}
/logout     GET    	Logout user	         -

- User Operations
Endpoint	             Method   	Description
/user	                 GET	      Get user profile
/user/change-password	 POST	      Change password
/user/upload	         POST      	Upload profile image

- Todo Operations
Endpoint	              Method	 Description	               Parameters
/user/todos	            POST	   Create new todo	           {title, description}
/user/todos/:id/delete	POST	   Delete todo	               id (MongoDB ObjectId)
/user/todos/:id/toggle	POST	   Toggle todo status	         id (MongoDB ObjectId)

- Admin Operations
Endpoint	                Method	   Description
/admin	                  GET	       Admin dashboard
/admin/create           	POST	     Create new user
/admin/update-user/:id	  POST	     Update user details
/admin/delete-user/:id	  POST	     Delete user
/admin/delete-todo/:id	  POST       Delete any todo


# Project stucture

project/
├── models/
│   ├── User.js
│   └── Todo.js
├── views/
│   ├── index.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── user.ejs
│   └── admin.ejs
├── app.js
├── package.json
└── .env
