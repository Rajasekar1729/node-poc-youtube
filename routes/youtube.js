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

router.post('/onPlayHome', auth, function(req, res) {
	youtube.onPlayHome(req, res);
});

module.exports = router;