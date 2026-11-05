import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';
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

const vreifyAPI = async(req,res,next)=>{
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({msg : "unauthorized"})
  }
  const token = authHeader.split(" ")[1];
  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${process.env.FRONEND_URL}/api/auth/jwks`)
    )
    const {payload} = await jwtVerify(token, JWKS)
    next()
  } catch (error) {
    res.status(401).send({msg : "unauthorized"})
  }
}

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

app.delete('/books/:id',vreifyAPI,async(req,res)=>{
  const id = req.params.id;
  const result = await bookscollection.deleteOne({_id: new ObjectId(id)});
  res.send(result);
})

app.patch('/books/:id',vreifyAPI, async(req,res)=>{
  const id = req.params.id;
  const quary = {_id : new ObjectId(id)};
  const body = req.body;
  const update = {
    $set:{
      ...body
    }
  }
  const result = await bookscollection.updateOne(quary,update)
  res.send(result);
});

app.post('/books',vreifyAPI,async(req,res)=>{
  const body = req.body;
  const result = await bookscollection.insertOne(body);
  res.send(result);
});

app.get('/borrows',vreifyAPI,async(req,res)=>{
  const data = await borrowscollection.find().toArray();
  res.send(data);
})

app.post('/borrows',vreifyAPI,async(req,res)=>{
  const body = req.body;
  const result = await borrowscollection.insertOne(body);
  res.send(result);
});

app.patch('/borrows/:id',vreifyAPI, async(req,res)=>{
  const id = req.params.id;
  const quary = {_id : new ObjectId(id)};
  const body = req.body;
  const update = {
    $set:{
      status: body.status,
    }
  }
  const result = await borrowscollection.updateOne(quary,update)
  res.send(result);
});

app.delete('/borrows/:id',vreifyAPI,async(req,res)=>{
  const id = req.params.id;
  const quary = {bookId : id};
  const result = await borrowscollection.deleteOne(quary);
  res.send(result);
})

app.listen(port, () => {
  console.log(`Server creat succsfull`)
});

export default app