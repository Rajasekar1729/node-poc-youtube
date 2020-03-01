var User = require("../models/user");
const models = require("../models");
var multer = require('multer');
var path = require('path');

var userController = {};

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: 'public/ProfilePhotos',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('profilePhotoPath');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

// Show list of users
userController.list = (req, res) => {
  User.find({}).exec((err, users) => {
    if (err) {
      console.log("Error:", err);
    }
    else {
      console.log("users", users)
      res.render("../views/users/users", {userList: users});
    }
  });
};

// Show list of users
userController.loginValidation = (req, res) => {
  try {  
    const user = models.User.findAll({
      raw: true,
      where: {
        username: req.body.username
      }
    }).then(function(users) {            
      if(users.length > 0) {  
        //req.session.LoggedIn = user[0];
        //res.redirect("/users");      
        res.render("index", { title: 'Login', IsError: false, ErrorDescription: "Login successfully."});
      } else {        
        res.render('index', { title: 'Login', IsError: true, ErrorDescription: "Unable to login Please signup."});
      }
    });    
  } catch (error) {    
    res.render('index', { title: 'Login',IsError: true, ErrorDescription: error.message });
  }  
};

//logout
userController.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

// Show user by id
userController.show = (req, res) => {
  User.findOne({_id: req.params.id}).exec((err, user) => {
    if (err) {
      console.log("Error:", err);
    }
    else {
      res.render("../views/users/edit", {user: user});
    }
  });
};

// Create new user
userController.create = (req, res) => {
  res.render("../views/users/create");
};

// Save new user
userController.save = (req, res) => {
  var user = new User(req.body);

  user.save((err) => {
    if(err) {
      console.log(err);
      res.render("../views/createAccount");
    } else {
      console.log("Successfully created an user.");
      req.session.LoggedIn = user;
      res.redirect("/users");
    }
  });
};

// Edit an user
userController.edit = (req, res) => {
  User.findOne({_id: req.params.id}).exec((err, user) => {
    if (err) {
      console.log("Error:", err);
    }
    else {
      res.render("../views/users/edit", {user: user});
    }
  });
};

// Update an user
userController.update = (req, res) => {
  User.findByIdAndUpdate(req.params.id, { $set: { username: req.body.username, email: req.body.email, age: req.body.age }}, { new: true }, (err, user) => {
    if (err) {
      console.log(err);
      res.render("../views/users/edit", {user: req.body});
    }
    res.redirect("/users");
  });
};

// Delete an user
userController.delete = (req, res) => {
  User.remove({_id: req.params.id}, (err) => {
    if(err) {
      console.log(err);
    }
    else {
      res.redirect("/users");
    }
  });
};

// Photo Upload an user
userController.photoUpload = (req, res) => {
  upload(req, res, (err) => {
    if(err){
      res.render('index', {
        msg: err
      });
      console.log("Upload Err", err);
    } else {
      if(req.file == undefined){
        console.log("No File");
      } else {
        User.findByIdAndUpdate(req.params.id, { $set: { profilePhotoPath: req.file.filename }}, { new: true }, (err, user) => {
          if (err) {
            console.log(err);
            res.render("../views/users/edit", {user: req.body});
          }
          res.send("Picture saved");
        });
      }
    }
  });  
};

module.exports = userController;