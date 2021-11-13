const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

// -----------------------------------
const app = express();
const port = process.env.PORT || 5000;

// ------------- Middlewares -----------------
app.use(cors());
app.use(express.json());

// ----------- Database Info -------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ds1tl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ----------- Database Manipulation -------------
async function run() {
  try {
    await client.connect();
    const database = client.db("BikeValley");
    const userCollection = database.collection("users");
    const bikeCollection = database.collection("bikes");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");

    // Get all bikes
    app.get("/bikes", async (req, res) => {
      const result = await bikeCollection.find({}).toArray();
      res.json(result);
    });

    // Get all reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.json(result);
    });

    // Get single bike
    app.get("/bikes/:id", async (req, res) => {
      const bikeId = ObjectId(req.params.id);
      const query = { _id: bikeId };
      const result = await bikeCollection.findOne(query);
      res.json(result);
    });

    // Get single user
    app.get("/users/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await userCollection.findOne(query);
      res.json(result);
    });

    // Get single user order
    app.get("/order/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await orderCollection.find(query).toArray();
      res.json(result);
    });

    // Get all order
    app.get("/order", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.json(result);
    });

    //-------------------------------------------------------------

    // Create User
    app.put("/users", async (req, res) => {
      const newUser = req.body;
      const filter = { email: req.body.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: newUser,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // Create Admin
    app.put("/makeAdmin/:email", async (req, res) => {
      const newAdmin = req.params.email;
      const filter = { email: newAdmin };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // update order status
    app.put("/order/:id", async (req, res) => {
      const orderId = ObjectId(req.params.id);
      const filter = { _id: orderId };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "shipped",
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //-------------------------------------------------------------

    // Create Product
    app.post("/bikes", async (req, res) => {
      const newBike = req.body;
      const result = await bikeCollection.insertOne(newBike);
      res.json(result);
    });

    // Create Order
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // Create Review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    //-------------------------------------------------------------

    // Delete user order
    app.delete("/order/:id", async (req, res) => {
      const orderId = ObjectId(req.params.id);
      const query = { _id: orderId };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

    // Delete product
    app.delete("/bikes/:id", async (req, res) => {
      const bikeId = ObjectId(req.params.id);
      const query = { _id: bikeId };
      const result = await bikeCollection.deleteOne(query);
      res.json(result);
    });

    //-------------------------------------------------------------
  } finally {
    // await client.close()
  }
}

run().catch(console.dir);

// -----------------------------------
app.get("/", (req, res) => {
  res.send("React server running");
});

// -----------------------------------
app.listen(port, () => {
  console.log("Server running at port ", port);
});
