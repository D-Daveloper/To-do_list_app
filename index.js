import express from "express";
import bodyParser from "body-parser";
import pg from "pg"
import {config} from "dotenv"

//load variables from .env file
config();

//set up Postgres 
const db = new pg.Client({
  user:process.env.USER,//database user
  database:process.env.DATABASE,// dataabase name
  host:process.env.HOST,//database host
  password: process.env.PASSWORD,//database password
  port:process.env.DBPORT //database port
});

const app = express();//set up express
const port = 3000;//configure a port to run app

db.connect()//connect to Postgres
app.use(bodyParser.urlencoded({ extended: true }));//set up body-parser middleware to access information from req.body
app.use(express.static("public"));// set the static files location for express

// set the id of the first user 
let currentUserId = 1

//returns the array of users fro users table
async function checkUsers(){
  return (await db.query("SELECT * FROM users")).rows
};

//returns the 'item id' and the item of the current user from the joined table of items and users
async function checkItems() {
  const result = await db.query("SELECT items.id,item FROM items JOIN users ON users.id = user_id WHERE user_id = $1;", 
    [currentUserId]);
  let items = [];
  result.rows.forEach((item) => {
    items.push(item);
  });
  return items;
};


app.get("/", async(req, res) => {
  const items = await checkItems()
  const users = await checkUsers()
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
    users:users
  });
});

app.post("/new", async (req,res)=>{
  try {
    const {name,color} = req.body//access the user input and sav to varibles
    await db.query("INSERT INTO users (name, color) Values ($1,$2)",[name,color])//insert into the users table the name and color 
    res.redirect("/")
  } catch (error) {
    console.log(error)
  }
});

app.post("/user", async (req, res) => {
  try { 
    if (req.body.add){
      res.render("new.ejs")
    }else{
      currentUserId = req.body.user
      res.redirect("/")
    }
  } catch (error) {
    console.log(error.message)
  }
});


app.post("/add", async (req, res) => {
  try {
    const item = req.body.newItem;
    await db.query("INSERT INTO items (item,user_id) VALUES ($1,$2)", [item,currentUserId])//insert into the items table the item and user_id which is the current user
    res.redirect("/");
  } catch (error) {
    console.log(error)
  }
});

app.post("/edit", async(req, res) => {
  try {
    await db.query("UPDATE items SET item = $1 WHERE id = $2", [req.body.updatedItemTitle,req.body.updatedItemId])//find and update an item using the id
    res.redirect("/")
  } catch (err) {
    console.log(err.message)
  }
});

app.post("/delete", async(req, res) => {
  await db.query("DELETE FROM items WHERE id = $1" ,[req.body.deleteItemId])//find and delete an item using its id
  res.redirect("/")
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

