const express = require('express');
const router = express.Router();
const user = require("../controllers/UserController.js");

// Authentication and Authorization Middleware
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

// Get all users
router.get('/',auth, (req, res) => {
  user.list(req, res);
});

// Get single user by id
router.get('/show/:id', auth, (req, res) => {
  user.show(req, res);
});

// Create user
router.get('/create', auth,(req, res) => {
  user.create(req, res);
});

// Save user
router.post('/save',(req, res) => {
  user.save(req, res);
});

// Save validation
router.get('/usernameValidation/:id',(req, res) => {
  console.log("usernameValidation req", req);
  user.usernameValidation(req, res);
});

// Edit user
router.get('/edit/:id', auth,(req, res) => {
  user.edit(req, res);
});

// Edit update
router.post('/update/:id', auth,(req, res) => {
  user.update(req, res);
});

// Edit update
router.post('/delete/:id', auth, (req, res, next) => {
  user.delete(req, res);
});

// Logout endpoint
router.get('/logout', (req, res) => {
  console.log("logout called")
  user.logout(req, res);
});

module.exports = router;
