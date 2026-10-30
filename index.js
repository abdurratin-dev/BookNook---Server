import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import 'dotenv/config';
const app = express()
const port = process.env.PORT || 5000;

app.use(cors());

const client = new MongoClient(process.env.MONGO_DB_URI);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const database = await connectToMongoDB();
const db = database.db('assignment8');
const collection = db.collection('products');
app.get('/', async(req, res) => {
    const data = await collection.find().toArray();
  res.send(data)
})

app.listen(port, () => {
  console.log(`Server creat succsfull`)
})