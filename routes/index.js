const express = require('express')
const router = express.Router()
const db = require('../db')
const userController = require('../controllers/user')
const postController = require('../controllers/posts')
const profileController = require('../controllers/profile')
const searchController = require('../controllers/search')
const { check, validationResult } = require('express-validator/check')

const config = require('../awsConf.json');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// config aws
aws.config.update({
    secretAccessKey: config.secretAccessKey,
    accessKeyId: config.accessKeyId,
    region: config.region
});

const s3 = new aws.S3();

// config aws s3 bucket
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'csc690',
        acl: 'public-read',
        metadata: function (request, file, cb) {
            cb(null, {fieldName: 'image'});
        },
        key: function (request, file, cb) {
            cb(null, Date.now().toString() + ".jpg");
        }
    })
});

router.post('/register', [
  check('username', 'Required, must contain only letters and numbers (a-zA-Z)').isAlphanumeric(),
  check('password', 'Minimum length is 8 characters').isLength({ min: 8 }),
  check('dob', 'Must be a valid date in the format YYYY-MM-DD').isISO8601().isLength({ min: 10, max: 10 })
], function(request, response, next) {

  const errors = validationResult(request);

  //respond with an error if validation fails
  if (!errors.isEmpty()) {
    return response.status(422).json({ errors: errors.array() })
  }
  userController.register(request, response, db)  
})

router.post('/login',[
  check('username', 'Please enter a username').exists(),
  check('password', 'Please enter a password').exists(),
], function(request, response, next) {

  const errors = validationResult(request);

  //respond with an error if validation fails
  if (!errors.isEmpty()) {
    return response.status(422).json({ errors: errors.array() })
  }

  userController.login(request, response, db)  
})

router.post('/createPost', [
  check('authToken', 'Please provide an authentication token').exists(),
  check('text', 'Please provide a message').exists(),
], function(request, response, next) {
  const errors = validationResult(request)
  //respond with an error if validation fails
  if (!errors.isEmpty()) {
    return response.status(422).json({ errors: errors.array() })
  }
  postController.create(request, response, db)  
})

router.post('/search', [
  check('query', 'Please provide a search value').exists(),
  check('authToken', 'Please provide an authentication token').exists()
], function(request, response, next) {
  const errors = validationResult(request)
  //respond with an error if validation fails
  if (!errors.isEmpty()) {
    return response.status(422).json({ errors: errors.array() })
  }
  searchController.search(request, response, db)  
})

router.post('/createProfile', upload.single('image'), function(request, response, next) {
  if (request.file) {
    profileController.create(request, response, db);
  } else {
    return response.status(422).json({ "msg": "Please provide an image" });
  }
});

module.exports = router