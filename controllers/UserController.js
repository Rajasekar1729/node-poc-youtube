const models = require("../models");
let userController = {};

// Show list of users
userController.list = (req, res) => {
  const user = models.User.findAll({
    raw: true
  }).then(function(users) { 
    console.log("users", users)
    res.render("../views/users/users", {userList: users});
  });
};

// Show list of users
userController.loginValidation = (req, res) => {
  try {  
    const user = models.User.findAll({
      raw: true,
      where: {
        username: req.body.username,
        password: req.body.password
      }
    }).then(function(users) {            
      if(users.length > 0) {  
        req.session.LoggedIn = users[0];
        if(users[0].isSuperUser == true) {
          res.redirect('/home');
        } else if(users[0].isActive == true) {
          const sendmail = sendMail(users[0].email,"OTP for POC Login", "OTP is 652091");
          res.redirect('/2f2-login');
        } else {
          res.render('index', { title: 'Login', IsError: true, ErrorDescription: "Unable to login Please contact adminstrator."});
        }        
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
    models.User.findOne(
      {raw: true,
      where: {id: req.params.id}
    }).then(function(users) {            
      res.render("../views/users/edit", {user: user});
    });
};

// Create new user
userController.create = (req, res) => {
  res.render("../views/users/create");
};

// Save new user
userController.save = (req, res) => {
  let request = req.body;
  request["isActive"] = true;
  request["isSuperUser"] = false;
  models.User.create(request, { raw:true}).then(function(user) {
    console.log("save users", user);
    if(user != undefined && user.length == 0) {
      console.log(err);
      res.render("../views/createAccount");
    } else {
      console.log("Successfully created an user.");
      req.session.LoggedIn = user;
      res.redirect("/home");
    }
  });  
};

// Edit an user
userController.edit = (req, res) => {
  models.User.findOne(
    {raw: true,
    where: {id: req.params.id}
  }).then(function(users) {            
    res.render("../views/users/edit", {user: user});
  });
};

// Update an user
userController.update = (req, res) => {
  models.User.update({ username: req.body.username, email: req.body.email }, { raw: true,
    where: {
      id: req.params.id
    }
  }).then(function(user) {
    if (user != undefined && user.length == 0) {
      console.log(err);
      res.render("../views/users/edit", {user: req.body});
    } else {
      res.redirect("/users");
    }    
  });
};

// Delete an user
userController.delete = (req, res) => {
  models.User.destroy({
    where: {
      id: req.params.id
    }
  }).then((user) => {
    res.redirect("/users");
  })
};

function sendMail(toMailId, subject, html) {
  var transporterPayer = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    service: 'gmail',
    auth: {
    user: 'bossraju1729',
    pass: 'Raju2020'
    },
    tls: {
    rejectUnauthorized: false
    }
  });
  
  
  mailOptions = {
    from: "bossraju1729@gmail.com",
    to: toMailId,
    subject: subject,  
    html: html
  };
  transporterPayer.sendMail(mailOptions, function(error, info) {
    if (error) {
    console.lo(error);
    } else {
    console.log("Email sent: " + info.response);
    }
  });
}

// Function to generate OTP 
function generateOTP(user) { 
  let string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
  let OTP = ''; 
  let len = string.length;
  for (let i = 0; i < 6; i++ ) { 
      OTP += string[Math.floor(Math.random() * len)]; 
  } 
  
  let subject = "OTP";
  let content = "<div><p>Hi " + user.firstname + " " + user.lastname +",</p><p>" + OTP + " is the One Time Pasword(OTP) for your login. Valid only for this login</p><p><a href='http://localhost:3000/2f2-login/"+ uuid +"'>Click here to login</a></p><div>"
}

module.exports = userController;
