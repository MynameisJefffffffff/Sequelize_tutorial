const express = require("express");
const app = express();
app.use(express.json());
const port = 2000;
const model = require("./models");
const jwt = require("jsonwebtoken");
const secretKey = "mysecretkey";

//let users = [];

app.post("/register", (req, res) => {
  //req.body = {username: "xxhiixxlim@gmail.com", password: "password"}
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;
  
  
  // Perform some hashing on the password here if desired

  // Check if username already exists

  async function createNewPatron() {
    model.patrons
      .findOne({
        where: {
          username: username,
        },
      })
      .then((res) => {
        console.log(res);
        if (res) {
          console.log("got data exist");
        } else {
          model.patrons.create({
            username: username,
            password: password,
          });
        }
      })
      .catch((error) => {
        console.error("Data not exist:");
      });

    //console.log('New patron created:', allrecord);
  }

  createNewPatron();
  //}

  // Add user to list
  //users.push({ username, password });
  res.send("OK");
});

app.post("/login", (req, res) => {
  //console.log(req.body);
  const login_username = req.body.username;
  const login_password = req.body.password;

  async function check_login_func() {
    model.patrons
      .findOne({
        where: {
          username: login_username,
          password: login_password,
        },
      })
      .then((data) => {
        console.log(data);
        if (data) {
          //console.log("login successfully");
          const payload = {
            username: login_username,
            password: login_password,
          };
          console.log("data", data);
          const token = jwt.sign(payload, secretKey);
          console.log("Login successful", token);
          //res.set('token', token);
          res.send({ token });
          console.log("Successful assign token to header");
        } else {
          console.log("invalid username or password");
        }
      })
      .catch((err) => {
        //console.log('lalala')
        console.error(err);
      });
  }
  check_login_func();
  
});

// Fake user information API
app.get('/user-info', authenticateToken, (req, res) => {
  async function checkauthenticateToken() {
  const user = model.patrons
  .findOne({
    where: {
      username: req.body.username,
    },
  }) .then((user_data) => {
    console.log(user_data);
    res.send(user_data);
  });
  

  if (!user) {
    res.sendStatus(404);
    return;
  }
}checkauthenticateToken();

  //const sensitiveData = { ssn: '123-45-6789', creditCard: '1234-5678-9012-3456' };
 // res.json({ username: user.username, ...sensitiveData });
});


// Middleware to validate access token
function authenticateToken(req, res, next) {
  const token = req.headers["token"];

  console.log('aa',token)

    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      console.log("Success ");
      next();
    });
}

// // API endpoint that returns user transactions if authenticated
// app.get("/transactions", authenticateToken, (req, res) => {
//   // Get user ID from authenticated user object
//   const userId = req.user.id;

//   // Filter transactions based on user ID
//   const userTransactions = transactions.filter((t) => t.userId === userId);

//   // Return transactions if user has any, otherwise return message
//   if (userTransactions.length > 0) {
//     res.json(userTransactions);
//   } else {
//     res.json({ message: "No transactions found for user" });
//   }
// });

app.listen(port, () => {
  console.log("Server listening on port ", port);
});
