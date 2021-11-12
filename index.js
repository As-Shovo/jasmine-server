const express = require('express')
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');

require('dotenv').config();


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.anxgc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db("jasmineDb");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");
        const usersCollection = database.collection("users");
        console.log("connected");



        // Data explore -------

        app.get('/explore', async (req, res) => {
            const cursor = productsCollection.find({});
            const result = await cursor.toArray();

            res.json(result);
        });

        // Data products ---------------

        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const result = await cursor.limit(6).toArray();
            res.json(result);
        });

        // Add Data productCollection
        app.post('/products', async (req, res) => {
            const data = req.body;
            const result = await productsCollection.insertOne(data);
            res.json(result);
        })

        // Delete Data productCollection
        app.delete('/explore/:id', async (req, res) => {
            const id = req.params.id;
            const quary = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(quary);
            res.json(result);
        })




        //Signle Data api
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const quary = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(quary);
            // console.log(result);
            res.json(result);
        });


        // Order collection API

        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log(order);
            const result = await ordersCollection.insertOne(order);
            console.log(result);

            res.send(result)
        });


        // find data by useign email
        app.get('/myOrders/:email', async (req, res) => {
            const email = req.params.email;
            const quary = { email: email };
            console.log(quary);
            const result = await ordersCollection.find(quary).toArray();
            res.send(result);
        });

        // delete Orders
        app.delete('/myOrders/:id', async (req, res) => {
            const id = req.params.id;
            const quary = { _id: ObjectId(id) };
            console.log(quary);
            const result = await ordersCollection.deleteOne(quary);
            res.json(result);
        });

        // all orders

        app.get('/myOrders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });


        // aproved Orders 
        app.put('/myOrders/:id', async (req, res) => {
            const id = req.params.id;
            const quary = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "success"
                },
            };
            const result = await ordersCollection.updateOne(quary, updateDoc, options);
            res.json(result);
        });

        // -------------------------------------------------
        // add User

        app.post('/users', async(req, res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.json(user)
        });

        app.put('/users', async(req, res) =>{
            const user = req.body;
            const quary = {email : user.email};
            console.log(user, quary);
            const options = {upsert: true};
            const updateDoc = {$set:{displayName: user.displayName}};
            const result = await usersCollection.updateOne(quary, updateDoc, options);
            res.json(result);

        });

        // make Admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = {email : user.email};
            const updateDoc = {$set:{role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
        });

        // Confirm to admin make admin
        app.get('/users/:email', async(req, res)=>{
            const email = req.params.email;
            const quary = {email : email};
            const user = await usersCollection.findOne(quary);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin})
        })



 










    }
    catch {

    } finally {
        // await client.close();
    }
}

run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('Hello server!')
})


app.listen(port, () => {
    console.log(port, "server listing");
})