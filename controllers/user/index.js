const jwt = require('jsonwebtoken')
const config = require('../../config.json')
const crypto = require('crypto')

exports.register = async function(request, response, db) {
  try {
    const username = request.body.username
    let msg = ''
    const [users, fields] = await db.execute('SELECT * FROM users WHERE username = ?', [username])
    if(users.length) {
      msg = 'Username already exists'
    } else {
      const password = crypto.createHash('md5').update(request.body.password).digest("hex")
      const dob = request.body.dob

      const insertedUser = await db.execute('INSERT INTO users SET username = ?, password = ?, dob = ?', [username, password, dob])
      // get user id of the user registered
      const userId = insertedUser[0].insertId

      if (userId) {
          // create auth token
          const token = jwt.sign({id: userId}, config.secret, {
              expiresIn: 600 // expires in 10 minutes
          })
          await db.execute('UPDATE users SET auth_token = ? WHERE id = ?', [token, userId])
          await db.execute(`
            INSERT IGNORE INTO user_followers 
            SET user_id = ?, follower_id = ?`, [userId, userId])
          
          msg = 'User created'

          return response.status(200).json({"authToken": token})
      } else {
          return response.status(400).json({"Error": "Username not found"})
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
    const [users, fields] = await db.execute('SELECT id, username, password FROM users WHERE username = ?', [username])
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
        return response.status(400).json({"Error": "Incorrect password."})
      }
    } else {
      return response.status(400).json({"Error": "Username not found."})
    }
  } 
  catch(err) {
    console.log(new Error(err))
    return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
  }
}

exports.logout = async function(request, response, db) {
    try {
        const userId = await exports.getUserByToken(request.body.authToken, db)
        if(!userId) return response.status(400).json({"Error": "Invalid auth token."})

        const [users, fields] = await db.execute(`UPDATE users SET auth_token = null WHERE id = ? `, [userId])

        response.status(200).json("Successfully logged out")
    }
    catch(err) {
        console.log(err)
        return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
    }
}

exports.getUserByToken = async function(token, db) {
  try {
    const [users, fields] = await db.execute('SELECT id FROM users WHERE auth_token = ?', [token])
    if(users[0])
      return users[0].id
    else
      return 0
  }
  catch(err) {
    console.log(new Error(err))
    return 0
  }
}
