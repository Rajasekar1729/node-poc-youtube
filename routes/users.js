var express = require('express');
var router = express.Router();
var user = require("../controllers/UserController.js");

// Authentication and Authorization Middleware
var auth = (req, res, next) => {
  if (req.session && req.session.LoggedIn != undefined)
    return next();
  else
    res.redirect("/");
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

module.exports = router;
