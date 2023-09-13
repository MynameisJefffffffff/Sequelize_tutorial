//next task: further insert harsh for password, salt and insert into database
const express        = require("express");
const app            = express();
const port           = 2000; //2000
const model          = require("./models");
const jwt            = require("jsonwebtoken");
const bcrypt         = require("bcrypt");
const secretKey      = "mysecretkey";
const bodyParser     = require("body-parser");
const axios          = require("axios");
const param          = require("./param.json");
const Joi            = require('joi');
const http           = require('http');
const { Server }     = require('socket.io');
const server         = http.createServer(app);
const { io }         = require("socket.io-client");
const socket         = io("http://127.0.0.1:3001", { autoConnect: true, reconnection: true, reconnectionDelay: 1000 });

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
  },
};

app.set('case sensitive routing', true)
app.use(express.json());
app.use(bodyParser.json());
// Socket.IO connection handling


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


//healthcheck api
app.get("/api/HealthCheck", async (req, res) => {
  try {
    
    res.json({ status: 'ok' });
  } catch (error) {}
});


app.get('/', function(req, res){
  res.sendFile(__dirname +'/socket_io_client_test.html');});

// Middleware to validate request body against schema
const validateRequest = (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
      return res.status(200).json({ errorCode: "ERR004" });
  }
  next();
};

//Notify Balance Change api
app.post("/api/NotifyBalanceChange", async (req, res) => {
  try {

    // Define schema using Joi
    const schema = Joi.object({
      gsId: Joi.string().required(),
      gpId: Joi.string().required(),
      command: Joi.string().required(),
      requestId: Joi.string().required(),
      data: Joi.object({
          playerId: Joi.string().required(),
          skinId: Joi.string().required(),
          secureToken: Joi.string().required(),
          balanceChangeDateTime: Joi.string().isoDate().required(),
          balanceArray: Joi.array().items(Joi.object({
              balanceType: Joi.string().valid('cashable').required(),
              balanceAmt: Joi.number().integer().required()
          })).required()
      }).required()
    });

    // Validate request body schema
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(200).json({ errorCode: "ERR004" });
    }

    const body = req.body;

    //retrieve all variable from request body
    const { gsId, gpId, command, requestId, data }                              = req.body;
    const {playerId, skinId, secureToken, balanceChangeDateTime, balanceArray}  = data;
    const {balanceType, balanceAmt}                                             = balanceArray;
    let text = [];
    //for loop to get each object from balanceArray
    //for (let i = 0; i < balanceArray.length; i++) {
      //do something here 
      //balanceArray[i]
      //text.push( balanceArray[i]);
    //}
    
    res.status(200).send();

    //use web socket broadcast received req.body from Playtech to egs
    


    socket.emit('balanceChange',body);
    //io.on('connection', (socket) => {
//
    //    socket.emit('balanceChange', {
    //      body
    //    });
  //
    //  socket.on('disconnect', () => {
    //    console.log('Socket.IO client disconnected');
    //  });
    //});

  } catch (error) {}
});

server.listen(port, () => {
  console.log("Server listening on port ", port);
});
