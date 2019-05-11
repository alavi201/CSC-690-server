const userController = require('../../controllers/user')

exports.follow = async function(request, response, db) {
    try {
      const userId = await userController.getUserByToken(request.body.authToken, db)
      if(!userId) return response.status(400).json({"Error": "Invalid auth token."})
  
      await db.execute(`
        INSERT IGNORE INTO user_followers 
        SET user_id = ?, follower_id = ?`, [request.body.followUserId, userId])
      return response.status(200).json("Successfully followed user")
    } 
    catch(err) {
      console.log(new Error(err))
      return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
    }
  }

exports.unfollow = async function(request, response, db) {
    try {
      const userId = await userController.getUserByToken(request.body.authToken, db)
      if(!userId) return response.status(400).json({"Error": "Invalid auth token."})
  
      await db.execute(`
        DELETE FROM user_followers
        WHERE user_id = ? 
        AND follower_id = ?`, [request.body.unfollowUserId, userId])
      return response.status(200).json("Successfully unfollowed user")
    } 
    catch(err) {
      console.log(new Error(err))
      return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
    }
  }
  