const userController = require('../../controllers/user')

exports.search = async function(request, response, db) {
    try {
        const userId = await userController.getUserByToken(request.body.authToken, db)
        if(!userId) return response.status(400).json({"Error": "Invalid auth token."})
        
        let results = {}
        const queryVal = '%'+request.body.query+'%'
        const [users, userFields] = await db.execute(`
            SELECT id, username, image_url 
            FROM users 
            WHERE username like ?`, [queryVal]
        ) 
        results['users'] = users

        const [posts, postFields] = await db.execute(`
            SELECT u.id, u.username, u.image_url, p.uuid, p.text, p.created_at 
            FROM users u
            JOIN posts p on p.user_id = u.id
            AND p.text like ? 
            ORDER BY p.id DESC`, [queryVal]
        )
        results['posts'] = posts
        return response.status(200).json({"results": results})
    } 
    catch(err) {
        console.log(err)
        return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
    }
  }