require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { ObjectId } = require('mongodb')
const port = (process.env.PORT || 5500)
const { MongoClient, ServerApiVersion } = require('mongodb');
const session = require('express-session');
const bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync('bacon', 8);


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
        //console.log("mongo call await inside f/n: ", result);
        return result;
    }
    catch (err) {
        console.log("getClarksGym() error: ", err);
    }
    finally {
        
    }
}

async function connectSchedule() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const result = await client.db("ClarksGym").collection("schedule").find().toArray();
        //console.log("mongo call await inside f/n: ", result);
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

async function connectReview() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const result = await client.db("ClarksGym").collection("reviews").find().toArray();
        //console.log("mongo call await inside f/n: ", result);
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

    //console.log("result: ", result);

    res.render('index', {
        pageTitle: "Clark's Gym",
        title: "Welcome to Clark's Gym",
        members: result

    });

});

app.get('/login', function (req, res) {
    if (!req.session.user) {
        res.render('login', {
            pageTitle: "Login",
            title: "Login to your account"
        })
    } else {
        res.redirect('/account');
    }
});



app.post('/loginCheck', async (req, res) => {
    try {

        // check if the user exists
        client.connect;
        const collection = await client.db("ClarksGym").collection("memberships"); 
        let user = await collection.findOne({ userName: req.body.userName });

        if (user || (await bcrypt.compare(req.body.password, user.password))) {
            // check if the password is correct
                // store the user in the session
                req.session.user = user;
                res.redirect('/account');
                console.log('Allowed');
                console.log(user);
            } else {
                res.send('Not Allowed. <a href="/login">Return to Login</a>');
                console.log('Not A');
                
            }
        } else {
            res.send('Invalid username and/or password. <a href="/login">Return to Login</a>');
            console.log('Not');
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
            if(req.body.password != req.body.password2){ 
                throw new Error("Passwords do not match");
            }
                //Remove password2 from the request body to prevent it from being added to the database
                delete req.body.password2; 

                client.connect;
                const collection = client.db("ClarksGym").collection("memberships");
        
                //draws from body parser 
                console.log(req.body);

                //hash the password before adding to database
                const salt = await bcrypt.genSalt();
                const hashed_password = await bcrypt.hash(req.body.password,salt);
                req.body.password = hashed_password;

                let user = await collection.insertOne(req.body);
                req.session.user = user;
                console.log("user: ", user);
                res.redirect('/');
            }
            catch (err) {
                console.log("error")
            }
            finally {
                // client.close()
            }
} );

app.get('/reviews', async (req, res) => {
    let result = await connectReview();

    console.log("result: ", result);

    res.render('reviews', {
        pageTitle: "Reviews",
        title: "View the Reviews",
        reviews: result
    })
});

app.post('/addReview', async (req, res) => {
    try{
        client.connect;
        const collection = client.db("ClarksGym").collection("reviews");

        console.log("body: ", req.body);
        let review = await collection.insertOne(req.body);
        console.log("review: ", review);
        res.redirect("/reviews");
    } catch {
        console.log("Error Adding Review!");
    } finally {
        //client.close();
    }
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
    if (!req.session.user) { 
        return res.redirect("/login"); 
      }
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
        if(req.body.password != req.body.password2){ 
            throw new Error("Passwords do not match");
        }

            //Remove password2 from the request body to prevent it from being added to the database
            delete req.body.password2;

            const salt = await bcrypt.genSalt();
                const hashed_password = await bcrypt.hash(req.body.password,salt);
                req.body.password = hashed_password;

        console.log("body: ", req.body);
        client.connect;
        const collection = client.db("ClarksGym").collection("memberships");
        let result = await collection.findOneAndUpdate(
            {_id: new ObjectId(req.body.id)},
            {$set: {name: req.body.name, 
                     password: hashed_password, 
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