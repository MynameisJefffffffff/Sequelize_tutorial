//next task: further insert harsh for password, salt and insert into database
const express = require("express");
const app = express();
app.use(express.json());
const port = 2000;
const model = require("./models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "mysecretkey";

//register api
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  // Check if username already exists
  const check_user = await model.patrons.findOne({where: {username}})

  if(!check_user){
    // Perform some hashing on the password here if desired
    const hashedPassword = await bcrypt.hash(password, 10);
    await model.patrons.create({username ,password: hashedPassword});
    res.status(200).send("Successfully registered");
  }
  else{
    res.status(500).send("Username taken");
  }
});


//login api
app.post("/login", async (req, res) => {
  //retrieve value from json 
  const { username, password } = req.body;
  //find post username data from database data, if data not find, invalid data
  const user = await model.patrons.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({ message: "Invalid username." });
  }
  //find post password data from database data, if data not find, invalid data
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return res.status(401).json({ message: "Invalid password." });
  }
  //once both username and password matched, proceed to generate token
  const payload ={username};
  const token = jwt.sign(payload, secretKey);
  console.log("Login successful", token);
  //res.set('token', token);
  res.status(200).json({ token });
});


//user-info api
app.get("/user-info", authenticateToken, async (req, res) => {
  let username = req.user.username;
  const users = await model.patrons.findOne({where: {username}});

  if(users)
    res.send(users)
  else
    res.status(404);
});


// Middleware to validate access token
// next function will execute after run the whole function, != return
function authenticateToken(req, res, next) {
  const token = req.headers["token"];
  if (!token) {
    return res.status(401).json({ message: 'Access token is missing.' });
  }
  jwt.verify(token, secretKey, (err, decodedtoken) => {
    if (err) return res.sendStatus(403);
    req.user = decodedtoken;
    console.log("Success ");
    next();
  });
}

app.listen(port, () => {
  console.log("Server listening on port ", port);
});