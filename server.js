const express = require("express");
const bodyParser = require("body-parser");
const { expect } = require("chai");
const cors = require("cors");
const helmet = require("helmet");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

const MONGODB_CONNECTION_STRING = process.env.DB;

const app = express();

app.use(helmet());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(cors({ origin: "*" })); // For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample front-end
app.route("/:project/").get((req, res) => {
  res.sendFile(`${process.cwd()}/views/issue.html`);
});

// Index page (static HTML)
app.route("/").get((req, res) => {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

// For FCC testing purposes
fccTestingRoutes(app);

// Connect to MongoDB
const client = new MongoClient(MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true
});
client.connect(err => {
  const db = client.db("tracker");
  // perform actions on the collection object

  // Routing for API
  apiRoutes(app, db);

  // 404 Not Found Middleware
  app.use((req, res, next) => {
    res
      .status(404)
      .type("text")
      .send("Not Found");
  });
});

// Start our server and tests!
app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${process.env.PORT}`);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(() => {
      try {
        runner.run();
      } catch (e) {
        const error = e;
        console.log("Tests are not valid:");
        console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; // for testing
