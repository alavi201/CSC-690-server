const userController = require('../../controllers/user')

exports.search = async function(request, response, db) {
    try {
        const userId = await userController.getUserByToken(request.body.authToken, db)
        if(!userId) return response.status(400).json({"Error": "Invalid auth token."})
        
        let results = {}
        const queryVal = '%'+request.body.query+'%'
        const [users, userFields] = await db.execute(`
            SELECT u.id, u.username, u.image_url, 
            CASE
                WHEN uf.follower_id = ?
                THEN 1
                ELSE 0
            END 
            AS followed
            FROM users u
            LEFT JOIN user_followers uf ON uf.user_id = u.id 
            WHERE username like ?`, [userId, queryVal]
        ) 
        results['users'] = users
        return response.status(200).json(results)
    } 
    catch(err) {
        console.log(err)
        return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
    }
  }