require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { ObjectId } = require('mongodb')
const port = (process.env.PORT || 5500)
const { MongoClient, ServerApiVersion } = require('mongodb');
const session = require('express-session');
const bcrypt = require('bcryptjs');


// set the view engine to ejs
let path = require('path');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    saveUninitialized: false,
    cookie: {maxAge: 60000} // expires after 1 minute
}));

// use res.render to load
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectMemberships() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
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

async function connectSchedule() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        const result = await client.db("ClarksGym").collection("schedule").find().toArray();
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

    let result = await connectMemberships();

    console.log("result: ", result);

    res.render('index', {
        pageTitle: "Clark's Gym",
        title: "Welcome to Clark's Gym",
        members: result

    });

});

app.get('/login', function (req, res) {

    res.render('login', {
        pageTitle: "Login",
        title: "Login to your account"
    })
});



app.post('/loginCheck', async (req, res) => {
    try {
        // check if the user exists
        client.connect;
        const collection = await client.db("ClarksGym").collection("memberships"); 
        let user = await collection.findOne({ userName: req.body.userName });
        if (user) {
            // check if the password is correct
            if (req.body.password === user.password) {
                // store the user in the session
                req.session.user = user;
                res.redirect('/account');
                console.log('Allowed');
                console.log(user);
            } else {
                res.send('Not Allowed');
                console.log('Not Allowed');
            }
        } else {
            res.send('Not Allowed');
            console.log('Not Allowed');
        }
    } catch (error) {
        console.log(error);
    }
});

app.post('/members', async (req, res) => {
    let result = await connectMemberships();

    console.log("result: ", result);

    res.render('members', {
        pageTitle: "Members",
        title: "Memberships",
        members: result
    })
});

app.get('/signup', async (req, res) => {
    
    res.render('signup', {
        pageTitle: "Sign Up",
        title: "Sign Up for a Membership",
    })
});

app.post('/signupNew', async (req, res) => {

    try {
                // console.log("req.body: ", req.body) 
                client.connect;
                const collection = client.db("ClarksGym").collection("memberships");
        
                //draws from body parser 
                console.log(req.body);
        
                await collection.insertOne(req.body);
        
        
                res.redirect('/signup');
            }
            catch (err) {
                console.log("error")
            }
            finally {
                // client.close()
            }
} );

app.get('/reviews', async (req, res) => {
    let result = await connectMemberships();

    console.log("result: ", result);

    res.render('reviews', {
        pageTitle: "Reviews",
        title: "View the Reviews",
        members: result
    })
});

app.get('/schedule', async (req, res) => {
    let resultSchedule = await connectSchedule();

    console.log("resultSchedule: ", resultSchedule);

    res.render('schedule', {
        pageTitle: "Schedule",
        title: "View the Weekly Schedule",
        schedule: resultSchedule
    })
});

app.get('/account', async (req, res) => {
    let result = await connectMemberships();

    //console.log("result: ", result);
    console.log("req.session.user: ", req.session.user);

    res.render('account', {
        pageTitle: "Account",
        title: "Your Account",
        members: result,
        name: req.session.user,
    })
});

app.post('/updateMember', async (req, res) => {
    try{
        console.log("body: ", req.body);
        client.connect;
        const collection = client.db("ClarksGym").collection("memberships");
        let result = await collection.findOneAndUpdate(
            {_id: new ObjectId(req.body.id)},
            {$set: {name: req.body.name, 
                     password: req.body.password, 
                     email: req.body.email, 
                     address: req.body.address, 
                     membership: req.body.membership,
                     type: req.body.type,
                }})
        .then(result => {
            console.log(result);
            res.redirect("/account")
        })
        .catch(error => console.error(error))
    } catch {
        console.log("error");
    }
    })

//  Delete from Database
app.post('/deleteMember', async (req, res) => {

    try {
        console.log("body: ", req.body);

        client.connect;
        const collection = client.db("ClarksGym").collection("memberships");
        let result = await collection.findOneAndDelete(
            {
                _id: new ObjectId(req.body.id)
            }
        )
            .then(result => {
                console.log(result);
                req.session.destroy();
                res.redirect('/');
            })
            .catch(error => console.error(error))
    }
    finally {
        //client.close()
    }

})

app.listen(port, () => {
    console.log(`quebec app listening on port ${port}`)
})