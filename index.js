import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config';
const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
const bookscollection = db.collection('books');
const borrowscollection = db.collection('borrows');

app.get('/', async(req, res) => {
  res.send({msg : "server connected sucssesfull"})
})

app.get('/books',async(req,res)=>{
  const data = await bookscollection.find().toArray();
  res.send(data);
})
app.get('/books/:id',async(req,res)=>{
  const id = req.params.id;
  const data = await bookscollection.findOne({_id: new ObjectId(id)});
  res.send(data);
})

app.post('/books',async(req,res)=>{
  const body = req.body;
  const result = await bookscollection.insertOne(body);
  res.send(result);
});

app.get('/borrows',async(req,res)=>{
  const data = await borrowscollection.find().toArray();
  res.send(data);
})

app.post('/borrows',async(req,res)=>{
  const body = req.body;
  const result = await borrowscollection.insertOne(body);
  res.send(result);
});

app.listen(port, () => {
  console.log(`Server creat succsfull`)
});

export default app