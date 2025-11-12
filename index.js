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

const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization

  if (!authorization) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized access. Token not found!",
    })
  }
  const token = authorization.split(" ")[1]

  try {
   
    const decodedUser = await admin.auth().verifyIdToken(token)
    req.decodedUser = decodedUser

    next()
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).send({
      success: false,
      message: "Unauthorized access. Invalid or expired token!",
    })
  }
}


async function run() {
  try {
    await client.connect();

    const db = client.db("food-lover");
    const slidersColl = db.collection("sliders");
    const reviewsColl = db.collection("reviews");
    const streetFoodColl = db.collection("street-food");
    const restaurantColl = db.collection("restaurant");

    app.get("/sliders", async (req, res) => {
      const result = await slidersColl.find().toArray();
      res.send(result);
    });
    app.get("/street-food", async (req, res) => {
      const result = await streetFoodColl.find().toArray();
      res.send(result);
    });
    app.get("/restaurant", async (req, res) => {
      const result = await restaurantColl.find().toArray();
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

    
    app.post("/reviews",verifyToken, async (req, res) => {
      const review = req.body;

      
      const result = await reviewsColl.insertOne(review);
      // console.log("Inserted review:", result)
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

