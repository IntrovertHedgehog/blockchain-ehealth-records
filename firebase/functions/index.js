const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const serviceAccount = require("./permission.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://blockchain-ehealth-records.firebaseio.com",
  // databaseURL: "http://127.0.0.1:8080.firebaseio.com",
});

const db = admin.firestore();

const app = express();

app.use(cors({origin: true}));

app.get("/demo", (req, res) => {
  return res.status(200).send("Hello there");
});

app.get("/api/main-records/:identifier", (req, res) => {
  (async () => {
    // res.header("")
    try {
      const identifier = req.params.identifier;
      const record = await db.collection("main-records").doc(identifier).get();
      if (record.exists) {
        return res.status(200).send(record.data());
      } else {
        return res.status(404).send();
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  })();
});

app.post("/api/main-records", (req, res) => {
  (async () => {
    try {
      const reqData = req.body;
      const identifier = crypto
          .createHash("md5")
          .update(JSON.stringify(reqData.data))
          .digest("base64url");
      reqData.identifier = identifier;
      console.log(reqData);
      await db.collection("main-records").doc(identifier).create(reqData);
      return res.status(201).send({
        identifier: identifier,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

exports.app = functions.https.onRequest(app);
