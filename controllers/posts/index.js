const crypto = require('crypto')

exports.create = async function(request, response, db) {
    try {
        const [users, fields] = await db.execute(`
            SELECT id 
            FROM users 
            WHERE auth_token = ?`, [request.body.authToken]
        )

        if(!users[0])
            return response.status(400).json({"Error": "Invalid auth token."})

        const user_id = users[0].id
        const uuid = crypto.randomBytes(10).toString('hex')
        const text = request.body.text
        const insertedPost = await db.execute(`
            INSERT INTO posts 
            SET 
            uuid = ?,
            user_id = ?,
            text = ?`, [uuid, user_id, text])
        
        //console.log(insertedPost[0].insertId)
        return response.status(200).json({"postId": uuid})
    } 
    catch(err) {
        console.log(err)
        return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
    }
  }