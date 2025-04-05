/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var bodyParser = require("body-parser");
var express = require("express");
var app = express();
var xhub = require("express-x-hub");
const { respondToComment } = require("./service");

app.use(xhub({ algorithm: "sha1", secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var token = process.env.TOKEN || "token";
var received_updates = [];

app.get("/", function (req, res) {
  //   console.log(req);
  res.send("hello world");
});

app.get(["/facebook", "/instagram", "/threads"], function (req, res) {
  if (
    req.query["hub.mode"] == "subscribe" &&
    req.query["hub.verify_token"] == token
  ) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(400);
  }
});

app.post("/facebook", function (req, res) {
  console.log("Facebook request body:", req.body);

  if (!req.isXHubValid()) {
    console.log(
      "Warning - request header X-Hub-Signature not present or invalid"
    );
    res.sendStatus(401);
    return;
  }

  console.log("request header X-Hub-Signature validated");
  // Process the Facebook updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

app.post("/instagram", async function (req, res) {
  try {
    console.log("Instagram request body:");
    console.log(JSON.stringify(req.body, null, 2));
    const commentId = req.body.entry[0].changes[0].value.id;
    const response = await respondToComment({
      commentId,
      message: "Check DM",
    });
    const result = await response.json();
    res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Internal server error" });
  }
});

app.post("/threads", function (req, res) {
  console.log("Threads request body:");
  console.log(req.body);
  // Process the Threads updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
