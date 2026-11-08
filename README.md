# Social Media App

A social media web application built using Node.js, Express.js, EJS, and SQLite. Users can create accounts, publish posts, interact with other users through replies, and search for posts and users.

## Features

### User Accounts
- Create an account with a username, email, and password.
- Log in and log out.
- Passwords are hashed using bcrypt.
- User sessions are maintained using express-session.

### Posts
- Create new posts with a title and content.
- View posts shared by other users.
- View individual posts on a separate details page.
- Edit your own posts.
- Delete your own posts.
- View your personal posts.

### Replies
- Reply to other users' posts.
- View replies under individual posts.
- Edit your own replies.
- Delete your own replies.

### Search
- Search for posts and users.
- Search through your own posts on the personal page.

## Technologies Used

- Node.js
- Express.js
- EJS
- SQLite
- bcrypt
- express-session
- HTML
- CSS

## Project Structure

Social-Media-App/
- backend/
  - app.js
- templates/
  - login.ejs
  - signup.ejs
  - home.ejs
  - personal.ejs
  - add-post.ejs
  - post-info.ejs
- static/
  - home.css
- .gitignore
- package.json
- package-lock.json
- README.md

## Installation

### 1. Clone the Repository

Run the following command:

    git clone YOUR_REPOSITORY_URL

### 2. Navigate to the Project Folder

    cd YOUR_PROJECT_FOLDER

### 3. Install Dependencies

    npm install

## Running the Application

Start the server from the project root directory:

    node backend/app.js

Once the server is running, open your browser and visit:

    http://localhost:3000

## Database

The application uses SQLite to store user accounts, posts, and replies.

The database tables are automatically created when the application starts. Database files (.db) are excluded from the Git repository.

## Notes

- Make sure Node.js and npm are installed before running the application.
- Run the server from the project root directory.
- Do not commit local database files or node_modules to the repository.