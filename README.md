# Authentication API

## About

This is a NodeJS/Express Authentication API written in TypeScript intended for personal use within my current and future projects.
Its main goal is to serve as a project-shared API and database, meaning that any user that creates an account in any of the projects using the API will be able to use the same account across my other platforms.

API functionalities include:

- Authentication (Signup, login, account verification via email, password reset/change, etc.)
- Friend system (Send friend requests, add/reject users, etc.)
- User profile pictures (Stored with AWS using the S3 service, processed with multer and sharp to control data size)
- API Key system, to ensure only authorized users (currently only me) can access the API's resources