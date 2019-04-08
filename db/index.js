var mysql = require('mysql2/promise')
var config = require('../config.json')
var db

try {
    db = mysql.createPool(config);
    console.log('Database is connected!')
} catch(err) {
    throw new Error(err)
}

module.exports = db