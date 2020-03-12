const express = require('express');
const router = express.Router();
const user = require("../controllers/UserController.js");
const youtube = require("../controllers/YoutubeController.js");

const auth = async (req, res, next) => {
	if (req.session && req.session.LoggedIn != undefined) {
	  const isActiveUser = await user.isCheckUserAcitve(req.session.LoggedIn.id);
	  if(isActiveUser == true){
		return next();
	  }
	  else {
		res.redirect("/");
	  }
	}    
	else {
	  res.redirect("/");
	}    
  };
  

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Youtube-POC', ErrorDescription: ''});
});

router.post('/login', (req,res) => {
  user.loginValidation(req, res);
});

router.get('/create-account', function(req, res) {
	res.render('create-account', {title: 'Create Account', ErrorDescription: ''})
});

router.get('/forget-password', function(req, res) {
	res.render('forget-password', {title: 'Forget Password', ErrorDescription: ''})
});

router.get('/reset-password/:id', function(req, res) {
	user.loadResetPassword(req, res);
});

router.post('/validateOTPResetPaasword', (req,res) => {
	user.validateOTPResetPaasword(req, res);
  });

router.post('/forgetPassword', (req,res) => {
	user.forgetPassword(req, res);
});

router.get('/2f2-login/:id', function(req, res) {
	user.load2f2Login(req, res)
})

router.post('/validation2f2Login', function(req, res) {
	user.login2f2Validation(req, res);
})

router.post('/resetPassword', function(req, res) {
	user.resetPassword(req, res);
})

router.get('/home', auth, function(req, res) {
	youtube.getHome(req, res);
})

router.get('/favorites', auth, function(req, res) {
	youtube.getFavorites(req, res);
})

module.exports = router;
