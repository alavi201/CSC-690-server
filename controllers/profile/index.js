exports.create = async function(request, response, db) {
    try {
        console.log(request.file);

        return response.status(200).json({"msg": "suceess"});
    }
    catch(err) {
        console.log(err)
        return response.status(500).json({"Error": "Unexpected error occured. Please try again in a while"})
    }
}