const express = require('express')
// creates and imports the express npm module so we have access to http methods
const app = express()
//assigns express to a variable called "app"
const MongoClient = require('mongodb').MongoClient
// connects our server to the mongoDB database
const PORT = 2121
//assigns the port number to the variable PORT
require('dotenv').config()
//gives us access to the hidden variables in the .env file

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'
//declares variables to hold the database, connection string and database name.

MongoClient.connect(dbConnectionStr, {useUnifiedTopology: true})
    .then(client => {
        console.log(`Hey, connected to ${dbName} database`)
        db = client.db(dbName)
    })
    .catch(err =>{
        console.log(err)
    })

app.set('view engine', 'ejs') 
app.use(express.static('public')) //Any files in the public folder, the server will serve up
app.use(express.urlencoded({ extended: true })) //We can look at our application, look at the request being sent
//- pull that form out of the request
app.use(express.json()) //We can look at our application, look at the request being sent
//- pull that form out of the request

app.get('/', async (req,res)=>{
    //request information from the server
    const todoItems = await db.collection('todos').find().toArray()
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    //
    res.render('index.ejs', {zebra: todoItems, left: itemsLeft})
    //renders our get request into an ejs file, which can be found on local host 2121.
})

app.post('/createTodo', (req, res)=>{
//listens for a post request from client and sends it to /createTodo
    db.collection('todos').insertOne({todo: req.body.todoItem, completed: false})
    //sends the information from the form, into the database collection called "todos."
    //creates a document in Mongodb, that has a "todo" property, and the value is coming
    //from the input of the form.
    //everytime we submit a form, its going to create another document of completed and 
    //set it as false
    .then(result =>{ //take the result of what occured
        console.log('Todo has been added!') 
        res.redirect('/') //responds with a page refresh (redirects to main page)
    })
})

app.put('/markComplete', (req, res)=>{
    db.collection('todos').updateOne({todo: req.body.rainbowUnicorn},{
        $set: {
            completed: true
        }
    })
    .then(result =>{
        console.log('Marked Complete')
        res.json('Marked Complete')
    })
})

app.put('/undo', (req, res)=>{
    db.collection('todos').updateOne({todo: req.body.rainbowUnicorn},{
        $set: {
            completed: false
        }
    })
    .then(result =>{
        console.log('Marked Complete')
        res.json('Marked Complete')
    })
})

app.delete('/deleteTodo', (req, res)=>{
    db.collection('todos').deleteOne({todo:req.body.rainbowUnicorn})
    .then(result =>{
        console.log('Deleted Todo')
        res.json('Deleted It')
    })
    .catch( err => console.log(err))
})
 
app.listen(process.env.PORT || PORT, ()=>{
    console.log('Server is running, you better catch it!')
})    
