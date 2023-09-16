const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const app = express();

app.use(express.json());
dotenv.config();
const posts = [
  {
    username: "prabhat",
    title: "post1",
  },
  {
    username: "bhargav",
    title: "post2",
  },
  {
    username: "new user",
    title: "post3",
  },
];
app.get("/posts", authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name))
});


app.listen(3000, () => {
  console.log("listening");
});

// middlewear to check that token is correct
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token === null) {
        // token is not present, therefore its Unauthorized request
        return res.sendStatus(401);
    }
    // the third parameter is a callback which takes error and the serialized data as 
    // the parameter
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user)=>{
        if(error) {
            // the token is present but its not valid
           return res.sendStatus(403);
        }
        // since token is valid we set the user on our request
        req.user = user;
        console.log('ssss', user);
        next();
    });
}