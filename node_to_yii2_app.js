//next task: further insert harsh for password, salt and insert into database
const express = require("express");
const app = express();
app.use(express.json());
const port = 2000; //2000 
const model = require("./models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "mysecretkey";
const axios = require('axios');
const param = require('./param.json')
const requestOptions = {
    headers: {
        'Content-Type': 'application/json'
    }
};

//nodejs to yii2 deposit api
app.post("/node_to_yii_deposit", async (req, res) => {
    const { username, amount } = req.body;
    // Check if username already exists

    const depositData = {
        username: username,
        amount: amount
      };

    axios.post(param.yii_url + '/api/test/deposit', depositData, requestOptions)
        .then(response => {
            res.status(200).json({"Msg":response.data});
        })
        .catch(error => {
            console.log(`Deposit failed. Error message: ${error.response.data}`);
        });
});

//nodejs to yii2 withdraw api
app.post("/node_to_yii_withdraw", async (req, res) => {
    const { username, amount } = req.body;
    // Check if username already exists

    const withdrawData = {
        username: username,
        amount: amount
      };

    axios.post(param.yii_url + '/api/test/withdraw', withdrawData, requestOptions)
        .then(response => {
            res.status(200).json({"Msg":response.data});
        })
        .catch(error => {
            console.log(`Deposit failed. Error message: ${error.response.data}`);
        });
});

app.listen(port, () => {
    console.log("Server listening on port ", port);
});
