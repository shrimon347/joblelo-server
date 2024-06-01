const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ppfmuai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// console.log(uri);

//middleware
const corsConfig = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsConfig));
app.options("", cors(corsConfig));
app.use(express.json());

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
    const jobleloCollection = client.db("Joblelo").collection("jobpost");
    const jobAppliedCollection = client.db("Joblelo").collection("AppliedJobs");
    const userCollection = client.db("Joblelo").collection("User");
    app.get("/jobpost", async (req, res) => {
      let query = {};
      // console.log(req.query);
      if (req.query?.email) {
        query = { email: req.query.email };
      }

      const result = await jobleloCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/jobpost", async (req, res) => {
      const newJob = req.body;
      const result = await jobleloCollection.insertOne(newJob);
      console.log(result);
      res.send(result);
    });

    app.get("/jobpost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobleloCollection.findOne(query);
      res.send(result);
    });
    app.put("/jobpost/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedJobs = req.body;
      const Job = {
        $set: {
          jobTitle: updatedJobs.jobTitle,
          companyName: updatedJobs.companyName,
          categorie: updatedJobs.categorie,
          JobType: updatedJobs.JobType,
          location: updatedJobs.location,
          salary: updatedJobs.salary,
          skills: updatedJobs.skills,
          qualifications: updatedJobs.qualifications,
          experience: updatedJobs.experience,
          country: updatedJobs.country,
          deadLine: updatedJobs.deadLine,
          rating: updatedJobs.rating,
          image: updatedJobs.image,
          description: updatedJobs.description,
        },
      };
      const result = await jobleloCollection.updateOne(filter, Job, option);
      res.send(result);
    });
    app.delete("/jobpost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobleloCollection.deleteOne(query);
      res.send(result);
    });

    //applied jobs
    app.post("/appliedjobs", async (req, res) => {
      const newApply = req.body;
      const result = await jobAppliedCollection.insertOne(newApply);
      // Increment the applicant number
      const jobId = new ObjectId(newApply.id);
      // console.log(jobId);
      await jobleloCollection.updateOne(
        { _id: jobId },
        { $inc: { jobApplicantsNumber: 1 } }
      );

      // console.log(result);
      res.send(result);
    });
    app.get("/appliedjobs", async (req, res) => {
      let query = {};
      console.log(req.query);
      if (req.query?.email && req.query?.id) {
        query = { email: req.query.email, id: req.query.id };
      } else if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await jobAppliedCollection.find(query).toArray();
      res.send(result);
    });

    // user data
    app.post("/user", async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const result = await userCollection.insertOne(newUser);
      // console.log(result);
      res.send(result);
    });
    app.get("/user", async (req, res) => {
      let query = {};
      // console.log(req.query);
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await userCollection.find(query).toArray();
      // console.log(result);
      res.send(result);
    });
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = {email}
      const result = await userCollection.findOne(query)
      // console.log(result);
      res.send(result);
    });
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      // console.log(req.query);

      const filter = { email };

      const option = { upsert: true };
      const updatedUser = req.body;
      const user = {
        $set: {
          displayName: updatedUser.displayName,
          photoURL: updatedUser.photoURL,
        },
      };
      const result = await userCollection.updateOne(filter, user, option);
      console.log(result);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Joblelo server is running");
});

app.listen(port, () => {
  console.log(` Joblelo server is running, ${port}`);
});
