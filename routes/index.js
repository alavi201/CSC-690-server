const express = require('express')
const router = express.Router()
const db = require('../db')
const controllers = require('../controllers')
const postController = require('../controllers/posts')
const profileController = require('../controllers/profile')
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
        metadata: function (req, file, cb) {
            cb(null, {fieldName: 'image'});
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + ".jpg");
        }
    })
});

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

router.post('/createPost', [
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

router.post('/createProfile', upload.single('image'), function(req, res, next) {
  if (req.file) {
    profileController.create(req, res, db);
  } else {
    return res.status(422).json({ "msg": "Please provide an image" });
  }
});

module.exports = router