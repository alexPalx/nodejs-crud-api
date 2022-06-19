## nodejs-crud-api

### How to use:

1. Clone this repository
2. Go to folder `nodejs-crud-api`
3. Use `npm i` to install the required modules
4. Use `npm run start:prod` to start product mode  
or `npm run start:dev` to start development mode
5. set PORT in .env file (optional, default 5000)
6. Use any Rest API Client (e.g. [Thunder Client for VS Code](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client)) for requests: 
- GET
    * `http://localhost:${PORT}/api/users` to get a list of users
    * `http://localhost:${PORT}/api/users/${userId}` to get user by uuid
- POST
    * `http://localhost:${PORT}/api/users` with Json Content like:  
    `{ "username": "Name", "age": 25, "hobbies": ["hobby1", "hobby2"] }`  
    to add this object to the database
- PUT
    * `http://localhost:${PORT}/api/users/${userId}` with Json Content like:  
    `{ "username": "Name", "age": 25, "hobbies": ["hobby1", "hobby2"] }`  
    to update this object in the database
- DELETE
    * `http://localhost:${PORT}/api/users/${userId}`  
    to remove this object from the database

The database already has some objects created for the example.
