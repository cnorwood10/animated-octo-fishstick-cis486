require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { ObjectId } = require('mongodb')
const port = (process.env.PORT || 5500)
const { MongoClient, ServerApiVersion } = require('mongodb');


// set the view engine to ejs
let path = require('path');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }))

// use res.render to load up an ejs view file


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectClarksGym() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        const result = await client.db("ClarksGym").collection("memberships").find().toArray();
        console.log("mongo call await inside f/n: ", result);
        return result;
    }
    catch (err) {
        console.log("getClarksGym() error: ", err);
    }
    finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}

// Read from Database
app.get('/', async (req, res) => {

    let result = await connectClarksGym();


    res.render('index', {
        pageTitle: "Clark's Gym",
        title: "Welcome to Clark's Gym",

    });

});

app.get('/login', async (req, res) => {
    res.render('login', {
        pageTitle: "Login",
        title: "Login to your account",
    })
});

app.get('/account', async (req, res) => {
    res.render('account', {
        pageTitle: "Account",
        title: "Your Account",
    })
} );

app.get('/members', async (req, res) => {
    let result = await connectClarksGym();
    res.render('members', {
        pageTitle: "Members",
        title: "Memberships"
    })
});

app.get('/login', async (req, res) => {
    let result = await connectClarksGym();
    res.render('login', {
        pageTitle: "Login",
        title: "Login to your account",
    })
});

app.get('/signup', async (req, res) => {
    res.render('signup', {
        pageTitle: "Sign Up",
        title: "Sign Up for a Membership",
    })
});

app.get('/reviews', async (req, res) => {
    res.render('reviews', {
        pageTitle: "Reviews",
        title: "View the Reviews",
    })
});

app.get('/schedule', async (req, res) => {
    res.render('schedule', {
        pageTitle: "Schedule",
        title: "View the Schedule",
    })
});



// app.get('/members', async (req, res) => {
    
//         let result = await connectClarksGym();
    
//         res.render('members', {
//             pageTitle: "Members",
//             members: result
//         });
    
//     });



// //Create to Database
// app.post('/addMember', async (req, res) => {

//     try {
//         // console.log("req.body: ", req.body) 
//         client.connect;
//         const collection = client.db("ClarksGym").collection("memberships");

//         //draws from body parser 
//         console.log(req.body);

//         await collection.insertOne(req.body);


//         res.redirect('/');
//     }
//     catch (err) {
//         console.log(err)
//     }
//     finally {
//         // client.close()
//     }

// });



// // Update to Database
// app.post('/updateMember', async (req, res) => {

//     try {

//         console.log("body: ", req.body);

//         client.connect;
//         const collection = client.db("ClarksGym").collection("memberships");
//         let result = await collection.findOneAndUpdate(
//             { _id: new ObjectId(req.body.id) },
//             { $set: { name: req.body.name, vehicleMileage: req.body.vehicleMileage } }
//         )

//             .then(result => {
//                 console.log(result);
//                 res.redirect('/');
//             })
//             .catch(error => console.error(error))
//     }
//     finally {
//         //client.close()
//     }

// });

// // Delete from Database
// app.post('/deleteMember', async (req, res) => {

//     try {
//         console.log("body: ", req.body);

//         client.connect;
//         const collection = client.db("ClarksGym").collection("memberships");
//         let result = await collection.findOneAndDelete(
//             {
//                 "_id": new ObjectId(req.body.id)
//             }
//         )
//             .then(result => {
//                 console.log(result);
//                 res.redirect('/');
//             })
//             .catch(error => console.error(error))
//     }
//     finally {
//         //client.close()
//     }

// })

app.listen(port, () => {
    console.log(`quebec app listening on port ${port}`)
})