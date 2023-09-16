require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())

// use a cache or db to store the refresh_token in prod
let refreshTokens = [];

app.post("/login", (req, res) => {
    const username = req.body.username;
    // once the user is authenticated
    const user = { name: username };
    // creating jwt token and return it to the client
    const accessToken = generateAccessToken(user);
    // we are using the same user used for creating refresh_token that was used while creating access token. so that we can easily create the access token 
    // from the refresh_token, we'll manually handle the expiration of refresh_token
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
  });

  function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '20s'});
  }

  // route to get new access token using the refresh token
  app.post('/token', (req, res)=>{
    const refreshToken = req.body.token;
    if(refreshToken === null) {
      res.sendStatus(401);
    }
    if(!refreshTokens.includes(refreshToken)) {
      // when refresh_token doesnot exists in the list of valid tokens
      return res.sendStatus(403);
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user)=>{
      if(error) {
        return res.sendStatus(403);
      }
      // {name: user.name} passing just the name and not the entire object, since refresh_token user object contains additional info also like iat
      const accessToken = generateAccessToken({name: user.name});
      res.json({accessToken: accessToken});
    })
  })  
// deleting the refresh_token when user logged out of the application, so that it becomes invalid
  app.delete('/logout', (req, res)=>{
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204);
  })
  app.listen(4000, ()=>{
    console.log('listening');
  });

  // the idea of refresh_token is to provide very short expiration time to the access tokens and
  // store the refresh_tokens safely somewhere in the db so that as soon as the access tokens expire
  // user has to get the new token using the refresh_token.
  // what if the refresh_token itself is stolen and then used to get the access token?
  // this can be handled by invalidating a refresh_token when the user has logged out of the application
  // i.e the refresh_token is removed from the list of valid refresh_tokens