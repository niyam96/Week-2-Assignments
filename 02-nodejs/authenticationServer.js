/**
  You need to create a HTTP server in Node.js which will handle the logic of an authentication server.
  - Don't need to use any database to store the data.

  - Save the users and their signup/login data in an array in a variable
  - You can store the passwords in plain text (as is) in the variable for now

  The expected API endpoints are defined below,
  1. POST /signup - User Signup
    Description: Allows users to create an account. This should be stored in an array on the server, and a unique id should be generated for every new user that is added.
    Request Body: JSON object with username, password, firstName and lastName fields.
    Response: 201 Created if successful, or 400 Bad Request if the username already exists.
    Example: POST http://localhost:3000/signup

  2. POST /login - User Login
    Description: Gets user back their details like firstName, lastName and id
    Request Body: JSON object with username and password fields.
    Response: 200 OK with an authentication token in JSON format if successful, or 401 Unauthorized if the credentials are invalid.
    Example: POST http://localhost:3000/login

  3. GET /data - Fetch all user's names and ids from the server (Protected route)
    Description: Gets details of all users like firstName, lastName and id in an array format. Returned object should have a key called users which contains the list of all users with their email/firstName/lastName.
    The users username and password should be fetched from the headers and checked before the array is returned
    Response: 200 OK with the protected data in JSON format if the username and password in headers are valid, or 401 Unauthorized if the username and password are missing or invalid.
    Example: GET http://localhost:3000/data

  - For any other route not defined in the server return 404

  Testing the server - run `npm run test-authenticationServer` command in terminal
 */

const express = require("express")
var bodyParser = require("body-parser")
const {v4: uuidv4} = require("uuid")
const jwt = require("jsonwebtoken")

const PORT = 3000;
const JWT_SECRET = 'RANDOM_SECRET'

const app = express();
// write your logic here, DONT WRITE app.listen(3000) when you're running tests, the tests will automatically start the server

var signedUpUsers = {}

app.use(bodyParser.json());

app.post('/signup', (req, res) => {
  var newUser = {};
  
  var email = req.body.email;

  if(email in signedUpUsers){
    res.status(400).send(`User ${email} already exists`);
  }
  else{
    newUser.password = req.body.password;
    newUser.firstName = req.body.firstName;
    newUser.lastName = req.body.lastName;
    newUser.email = email;
    newUser.id = uuidv4()

    signedUpUsers[email] = newUser;

    //console.log(signedUpUsers)
    res.status(201).send(`Signup successful`);
  }

});

app.post('/login', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  if(!(email in signedUpUsers)){
    res.status(401).send('Unauthorized');
  }
  else{
    var user = signedUpUsers[email];
    //console.log(user);

    if(password !== user.password)
    {
      res.status(401).send('Unauthorized');
    }

    var authToken = Math.random() * 10000;
    var response = {
      "email": user.email,
      "firstName": user.firstName,
      "lastName": user.lastName,
      "authToken": authToken
    }

    res.status(200).send(response);
  }
});


app.get('/data', (req, res) => {
  var email = req.headers.email;
  var password = req.headers.password;

  if(!email || !password || !(email in signedUpUsers))
  {
    res.status(401).send('Unauthorized');
  }

  var user = signedUpUsers[email];
  if(user.password !== password)
  {
    res.status(401).send('Unauthorized');
  }

  var users = {"users":[]}
  Object.keys(signedUpUsers).forEach(key => {
    var signedUpUser = signedUpUsers[key];

    var userDetails = {
      "email": signedUpUser.email,
      "firstName": signedUpUser.firstName,
      "lastName": signedUpUser.lastName
    }
    users["users"].push(userDetails);
  });

  res.status(200).send(users);
});


//app.listen(PORT, () => console.log(`Listening on ${PORT}`))

module.exports = app;
