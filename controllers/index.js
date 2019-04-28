const jwt = require('jsonwebtoken')
const config = require('../config.json')
const crypto = require('crypto')

exports.register = async function(request, response, db) {
  try {
    const username = request.body.username
    let msg = ''
    const [users, fields] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if(users.length) {
      msg = 'Username already exists'
    } else {
      const password = crypto.createHash('md5').update(request.body.password).digest("hex")
      const dob = request.body.dob
      await db.execute('INSERT INTO users SET username = ?, password = ?, dob = ?', [username, password, dob])

      // create auth token
      const [user, field] = await db.execute('SELECT id, username, password FROM users WHERE username = ?', [username]);

      //check if passwords match
      if (user[0].password === password) {
          // create a token
          const token = jwt.sign({id: user[0].id}, config.secret, {
              expiresIn: 600 // expires in 10 minutes
          })
          await db.execute('UPDATE users SET auth_token = ? WHERE id = ?', [token, user[0].id])
          msg = 'User created'

          return response.status(200).json({"authToken": token})
      } else {
          return response.status(200).json({"Error": "Incorrect password."})
      }
    }
    return response.status(200).json({"Message": msg})
  } catch(err) {
   console.log(new Error(err))
   return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
  }
}

exports.login = async function(request, response, db) {
  try {
    const username = request.body.username
    const [users, fields] = await db.execute('SELECT id, username, password FROM users WHERE username = ?', [username]);
    if(users.length > 0) {
      const password = crypto.createHash('md5').update(request.body.password).digest("hex")
      //check if passwords match
      if(users[0].password === password){
        // create a token
        const token = jwt.sign({ id: users[0].id }, config.secret, {
          expiresIn: 600 // expires in 10 minutes
        })
        await db.execute('UPDATE users SET auth_token = ? WHERE id = ?', [token, users[0].id])
        return response.status(200).json({"authToken": token})
      } else{
        return response.status(200).json({"Error": "Incorrect password."})
      }
    } else {
      return response.status(200).json({"Error": "Username not found."})
    }
  } 
  catch(err) {
    console.log(new Error(err))
    return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
  }
}