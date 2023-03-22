//next task: further insert harsh for password, salt and insert into database
const express = require("express");
const app = express();
app.use(express.json());
const port = 2000; //2000
const model = require("./models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "mysecretkey";
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const axios = require("axios");
const param = require("./param.json");
const requestOptions = {
  headers: {
    "Content-Type": "application/json",
  },
};


//register api
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // make sure password is in string before proceed to hash
    var pass = String(password);

    // Check if username already exists
    const check_user = await model.patrons.findOne({ where: { username } });

    if (!check_user) {
      // Perform some hashing on the password here if desired (password must be in string else cant proceed to hash)
      const hashedPassword = await bcrypt.hash(pass, 10);
      const pat_fid = await model.patrons.create({
        username,
        password: hashedPassword,
      });

      //retrieve the patron id to create wallet account after account registered
      await model.wallets.create({ patronId: pat_fid.id, balance: 0 });
      res.status(200).send({ "Successfully registered": req.body });
    } else {
      res.status(500).send("Username taken");
    }
  } catch (error) {
    console.log(error);
  }
});

//login api
app.post("/login", async (req, res) => {
  try {
    //retrieve value from json
    const { username, password } = req.body;

    // make sure password is in string before proceed to hash
    var pass = String(password);

    //find post username data from database data, if data not find, invalid data/
    const user = await model.patrons.findOne({ where: { username } }); //.catch(er=>(console.log(er)));
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Invalid username." });
    }

    //find post password data from database data, if data not find, invalid data
    const isPasswordMatch = await bcrypt.compare(pass, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }
    //once both username and password matched, proceed to generate token
    const payload = { username };
    const token = jwt.sign(payload, secretKey);
    console.log("Login successful", token);
    //res.set('token', token);
    res.status(200).json({ token });
  } catch (error) {
    console.log(error);
  }
});

//user-info api
app.get("/user-info", authenticateToken, async (req, res) => {
  try {
    let username = req.body.username;
    const users = await model.patrons.findOne({ where: { username } });
    const balance = await model.wallets.findOne({
      where: { patronId: users.id },
    });
    if (users) res.status(200).json({ users, balance });
    else res.status(404);
  } catch (error) {}
});

// Middleware to validate access token
// next function will execute after run the whole function, != return
function authenticateToken(req, res, next) {
  const token = req.headers["token"];
  if (!token) {
    return res.status(401).json({ message: "Access token is missing." });
  }
  jwt.verify(token, secretKey, (err, decodedtoken) => {
    if (err) return res.sendStatus(403);
    req.body = decodedtoken;
    console.log("decodedtoken ", req.body);
    next();
  });
}

function isValidJson(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }}
  

//deposit api
app.post("/deposit", async (req, res) => {
  
  try {
    
      const { username, amount } = req.body;
    
    if (typeof amount != "number") {
      res.status(500).send({ MSG: "Only numeric allow" });
    }
    if (amount < 1) {
      res.status(500).send({ MSG: "No negative value allow" });
    }

    const user = await model.patrons.findOne({ where: { username } });
    //if user is available then only enable user to proceed deposit
    if (user) {
      await model.transaction_logs.create({ username, amount }); //.catch(err=>console.log(err));
      const wallet = await model.wallets.findOne({
        where: { patronId: user.id },
      });
      wallet.balance = wallet.balance + amount;
      await wallet.save();
      res.status(200).send({
        MSG: "Successfully withdraw",
        Amount: amount,
        Balance: wallet.balance,
      });
    } else {
      res.status(500).send({ MSG: "Invalid account" });
    }
  } catch (error) {}
});

//withdraw api
app.post("/withdraw", async (req, res) => {
  try {
    const { username, amount } = req.body;
    console.log(username, amount);
    if (typeof amount != "number") {
      res.status(500).send({ MSG: "Only numeric allow" });
    }
    if (amount < 1) {
      res.status(500).send({ MSG: "No negative value allow" });
    }

    const user = await model.patrons.findOne({ where: { username } });
    //if user is available then only enable user to proceed deposit
    if (user) {
      await model.transaction_logs.create({ username, amount }); //.catch(err=>console.log(err));
      const wallet = await model.wallets.findOne({
        where: { patronId: user.id },
      });
      if (amount <= wallet.balance) {
        wallet.balance = wallet.balance - amount;
        await wallet.save();

        console.log("wallet.amount: ", amount);
        console.log("wallet.balance: ", wallet.balance);

        res.status(200).send({
          MSG: "Successfully withdraw",
          Amount: amount,
          Balance: wallet.balance,
        });
      } else res.status(500).send({ MSG: "Insufficient balance" });
    } else {
      res.status(500).send({ MSG: "Invalid account " });
    }
  } catch (error) {}
});

//nodejs to yii2 deposit api
app.post("/node_to_yii_deposit", async (req, res) => {
  const { username, amount } = req.body;

  const depositData = {
    username: username,
    amount: amount,
  };

  axios
    .post(param.yii_url + "/api/test/deposit", depositData, requestOptions)
    .then((response) => {
      res.status(200).json({ Msg: response.data });
    })
    .catch((error) => {
      console.log(`Deposit failed. Error message: ${error.response.data}`);
    });
});

//nodejs to yii2 withdraw api
app.post("/node_to_yii_withdraw", async (req, res) => {
  const { username, amount } = req.body;
  // Check if username already exists

  const withdrawData = {
    username: username,
    amount: amount,
  };

  axios
    .post(param.yii_url + "/api/test/withdraw", withdrawData, requestOptions)
    .then((response) => {
      res.status(200).json({ Msg: response.data });
    })
    .catch((error) => {
      console.log(`Deposit failed. Error message: ${error.response.data}`);
    });
});

app.listen(port, () => {
  console.log("Server listening on port ", port);
});
