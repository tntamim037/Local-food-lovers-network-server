const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

const admin = require("firebase-admin");
const serviceAccount = require("./service.json");

app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const uri =
  "mongodb+srv://food-lover037:hEs9utZiR349Ua2L@cluster0.xgnza1z.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


async function run() {
  try {
    await client.connect();

    const db = client.db("food-lover");
    const slidersColl = db.collection("sliders");
    const reviewsColl = db.collection("reviews");

    app.get("/sliders", async (req, res) => {
      const result = await slidersColl.find().toArray();
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const { foodName } = req.query;
      let query = {};
      if (foodName) {
        query.foodName = { $regex: foodName, $options: "i" };
      }

      const result = await reviewsColl.find(query).toArray();
      res.send(result);
      
    });

    
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsColl.insertOne(review);
      res.send(result);
    });



   app.get("/reviews/:id", async (req, res) => {
  const { id } = req.params;
  const objectId = new ObjectId(id);

  const result = await reviewsColl.findOne({ _id: objectId });

  res.send({ success: true, result });
});
   

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running perfectly");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

