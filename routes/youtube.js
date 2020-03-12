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

router.post('/playHome', auth, function(req, res) {
	youtube.onPlayHome(req, res);
});

router.get('/getSearch/:id', auth, function(req, res) {
	youtube.getSearchVideo(req, res);
});

router.get('/getLanguage/:id', auth, function(req, res) {
	youtube.getLangugeVideo(req, res);
});

router.post('/addToFavorite', auth, function(req, res) {
	youtube.addToFavorite(req, res);
});

router.post('/removeToFavorite', auth, function(req, res) {
	youtube.removeToFavorite(req, res);
});

router.get('/checkFavorite/:id', auth, function(req, res) {
	youtube.checkFavorite(req, res);
});

module.exports = router;