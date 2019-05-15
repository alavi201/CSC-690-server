const userController = require('../../controllers/user')

exports.create = async function(request, response, db) {
    try {
        const userId = await userController.getUserByToken(request.body.authToken, db)
        if(!userId) return response.status(400).json({"Error": "Invalid auth token."})

        const imageUrl = request.file.location
        const [users, fields] = await db.execute(`
            UPDATE users
            SET image_url = ?
            WHERE id = ?`, [imageUrl, userId]
        )

        return response.status(200).json({"msg": "Successfully uploaded profile picture"})
    }
    catch(err) {
        console.log(err)
        return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
    }
}

exports.getProfile = async function(request, response, db) {
    try {
        const userId = await userController.getUserByToken(request.body.authToken, db)
        if(!userId) return response.status(400).json({"Error": "Invalid auth token."})
        
        const [user, fields] = await db.execute(`
            SELECT username, dob, image_url 
            FROM users
            WHERE id = ?`, [userId]
        )

        return response.status(200).json(user)
    }
    catch(err) {
        console.log(err)
        return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
    }
}