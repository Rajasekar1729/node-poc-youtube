const express = require('express');
const router = express.Router();
const user = require("../controllers/UserController.js");
const youtube = require("../controllers/YoutubeController.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Youtube-POC', ErrorDescription: ''});
});

router.post('/login', (req,res) => {
  user.loginValidation(req, res);
});

router.get('/create-account', function(req, res) {
	res.render('create-account', {title: 'Create Account', ErrorDescription: ''})
})

router.get('/2f2-login/:id', function(req, res) {
	user.load2f2Login(req, res)
	//res.render('2f2login', {title: '2F2 Login', ErrorDescription: ''})
})

router.post('/validation2f2Login', function(req, res) {
	user.login2f2Validation(req, res);
})

router.get('/home', function(req, res) {
	youtube.get(req, res);
	//res.render('./youtube/home', {title: 'Home'})
})

router.get('/favorites', function(req, res) {
	res.render('./youtube/favorites', {title: 'Favorites'})
})

module.exports = router;
