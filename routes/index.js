const express = require('express')
const router = express.Router()
const db = require('../db')
const controllers = require('../controllers')
const postController = require('../controllers/posts')
const { check, validationResult } = require('express-validator/check')

router.post('/register', [
  check('username', 'Required, must contain only letters and numbers (a-zA-Z)').isAlphanumeric(),
  check('password', 'Minimum length is 8 characters').isLength({ min: 8 }),
  check('dob', 'Must be a valid date in the format YYYY-MM-DD').isISO8601().isLength({ min: 10, max: 10 })
], function(req, res, next) {

  const errors = validationResult(req);

  //respond with an error if validation fails
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }
  controllers.register(req, res, db)  
})

router.post('/login',[
  check('username', 'Please enter a username').exists(),
  check('password', 'Please enter a password').exists(),
], function(req, res, next) {

  const errors = validationResult(req);

  //respond with an error if validation fails
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  controllers.login(req, res, db)  
})

router.post('/createPost',[
  check('authToken', 'Please provide an authentication token').exists(),
  check('text', 'Please provide a message').exists(),
], function(req, res, next) {
  const errors = validationResult(req)
  //respond with an error if validation fails
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }
  postController.create(req, res, db)  
})

module.exports = router