require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors({
  origin: ["http://localhost:5173", "https://assignment-10-art-and-craft.web.app"]
}));
app.use(express.json());
console.log();
// mongodb atlas

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.plslana.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const artCollection = client.db("artAndCraft").collection("art");
    const usersCollection = client.db("artAndCraft").collection("users");
    const sub_categoryCollection = client
      .db("artAndCraft")
      .collection("sub_category");
    const default_craftsCollection = client
      .db("artAndCraft")
      .collection("default_crafts");

    // post users, it will be crud oparation. we will use create (c) from crud oparation
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.post("/addCraftItem", async (req, res) => {
      const craftItems = req.body;
      const result = await artCollection.insertOne(craftItems);
      res.send(result);
    });

    // read data, it will be crud oparation, we will use now read (r) from crud oparation
    app.get("/myArtAndCraftList/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = artCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/default_crafts", async (req, res) => {
      const cursor = default_craftsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/subCategoriesLists", async (req, res) => {
      const cursor = sub_categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/subCategoriesLists/:sub_categories", async (req, res) => {
      const sub_category = req.params.sub_categories;
      const query = { sub_category: sub_category };
      const artCursor = artCollection.find(query);
      const defaultCraftCursor = default_craftsCollection.find(query);
      const defaultCraftArray = await defaultCraftCursor.toArray();
      const artArray = await artCursor.toArray();
      const [defaultCraftArrayResult, artArrayResult] = await Promise.all([
        defaultCraftArray,
        artArray,
      ]);
      const result = [...defaultCraftArrayResult, ...artArrayResult];
      res.send(result);
    });
    app.get("/allArtAndCraftItems", async (req, res) => {
      const result = await artCollection.find().toArray();
      res.send(result);
    });

    // read single data
    app.get("/craftDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await artCollection.findOne(query);
      res.send(result);
    });
    app.get("/craftUpdates/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await artCollection.findOne(query);
      res.send(result);
    });

    // update data, it will be a crud oparation, we weill use now updata (u) from crud oparaions

    app.put("/craftUpdates/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateCraft = req.body;
      const updatedCraft = {
        $set: {
          photoUrl: updateCraft.photoUrl,
          item_name: updateCraft.item_name,
          sub_category: updateCraft.sub_category,
          short_des: updateCraft.short_des,
          price: updateCraft.price,
          rating: updateCraft.rating,
          customization_value: updateCraft.customization_value,
          processing_time: updateCraft.processing_time,
          stock_status: updateCraft.stock_status,
        },
      };

      const result = await artCollection.updateOne(
        filter,
        updatedCraft,
        options
      );
      res.send(result);
    });

    // delete data, it will be a crud oparation, we weill use now delete (d) from crud oparaions
    app.delete("/craftDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await artCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Art And Craft Server is running");
});

app.listen(port, () => {
  console.log(`art and craft is running on port ${port}`);
});
