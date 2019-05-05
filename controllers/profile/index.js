exports.create = async function(request, response, db) {
    try {
        const imageUrl = request.file.location;
        const [users, fields] = await db.execute(`
            UPDATE users
            SET image_url = ?
            WHERE auth_token = ?`, [imageUrl, request.body.authToken]
        );

        return response.status(200).json({"msg": "Suceess"});
    }
    catch(err) {
        console.log(err);
        return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"});
    }
};