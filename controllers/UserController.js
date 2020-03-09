const uuidv4 = require('uuid/v4');
const nodemailer = require("nodemailer");
const models = require("../models");
let userController = {};

// Show list of users
userController.list = (req, res) => {
  const user = models.User.findAll({
    raw: true
  }).then(function(users) { 
    console.log("users", users)
    let filterUser = users.filter((user) => {
      if(user.isSuperUser == false) {
        user["isActive"] = user["isActive"] == true ? "Yes" : "No";
        return user;
      }
    })
    res.render("../views/users/users", { title: "Users Management", userList: filterUser});
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
          generateOTP(users[0],res);          
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
  models.User.create(request).then(function(userEntity) {
    const dataObj = userEntity.get({plain:true});
    console.log("dataObj",dataObj)
    if(dataObj != undefined && dataObj.length == 0) {
      console.log(err);
      res.render("../views/createAccount");
    } else {
      console.log("Successfully created an user.");
      req.session.LoggedIn = dataObj;
      res.redirect("/home");
    }
  });  
};

// Edit an user
userController.edit = (req, res) => {
  models.User.findAll(
    {raw: true,
    where: {id: req.params.id}
  }).then(function(users) {    
    if(users.length > 0) {
      res.render("../views/users/edit", {title: "User Edit", user: users[0]});
    } else {
      res.redirect("/users");
    }    
  });
};

// Update an user
userController.update = (req, res) => {
  models.User.update({ username: req.body.username, email: req.body.email, lastname: req.body.lastname, firstname: req.body.firstname, isActive: req.body.isActive }, { raw: true,
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

function sendMail(toMailId, subject, html, newUuid, res) {
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
    res.render('index', { title: 'Login',IsError: true, ErrorDescription: error.message });
    } else {
    console.log("Email sent: " + info.response);
    res.redirect('/2f2-login/' + newUuid);
    }
  });
}

// Function to generate OTP 
function generateOTP(user,res) { 
  let string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
  let OTP = ''; 
  let len = string.length;
  for (let i = 0; i < 6; i++ ) { 
      OTP += string[Math.floor(Math.random() * len)]; 
  } 

  let newUuid = uuidv4();
  
  let subject = "OTP";
  let content = "<div><p>Hi " + user.firstname + " " + user.lastname +",</p><p>" + OTP + " is the One Time Pasword(OTP) for your login. Valid only for this login</p><p><a href='http://localhost:3000/2f2-login/"+ newUuid +"'>Click here to login</a></p><div>"

  let request = {
    uuid: newUuid,
    user_id: user.id,
    otp: OTP
  }

  models.OTPEntries.create(request).then(function(otpEntryEntity) {
    const dataObj = otpEntryEntity.get({plain:true})
    console.log("otpEntry", dataObj);
    sendMail(user.email, subject, content, newUuid,res);
  });
}

// login 2f2 validation
userController.login2f2Validation = (req, res) => {
  try {  
    const user = models.OTPEntries.findAll({
      raw: true,
      where: {
        otp: req.body.otpPassword
      }
    }).then(function(dataObj) {            
      if(dataObj.length > 0) {
        req.session.LoggedIn["login2f2Valid"] = true;
        res.redirect('/home');               
      } else {     
        req.session.LoggedIn["login2f2Valid"] = false;   
        res.render('2f2login', { title: '2F2 Login', IsError: true, ErrorDescription: "Please enter valid OTP."});
      }
    });    
  } catch (error) {    
    res.render('2f2login', { title: '2F2 Login',IsError: true, ErrorDescription: error.message });
  }  
};

// Show list of users
userController.load2f2Login = (req, res) => {
  try {  
    models.OTPEntries.findAll({
      raw: true,
      where: {
        uuid: req.params.id
      }
    }).then(function(dataObj) {               
      if(dataObj.length > 0) {
        models.OTPEntries.findAll({
          raw: true,
          where: {
            user_id: dataObj[0].user_id
          },
          order: [
            ['createdAt', 'DESC']
        ],
        }).then(function(listById) {
          if(listById.length > 0 && listById[0].uuid == req.params.id) {
            const user = models.User.findAll({
              raw: true,
              where: {
                id: dataObj[0].user_id
              }
            }).then(function(users) {            
              if(users.length > 0) {                  
                if(users[0].isActive == true) {
                  req.session.LoggedIn = users[0];
                  res.render('2f2login', {title: '2F2 Login', ErrorDescription: ''})          
                } else {
                  res.render('2f2login', {title: '2F2 Login', ErrorDescription: 'OTP is Expired'});
                }        
              } else {        
                res.render('2f2login', {title: '2F2 Login', ErrorDescription: 'OTP is Expired'});
              }
            });   
            
          } else {
            res.render('2f2login', {title: '2F2 Login', ErrorDescription: 'OTP is Expired'})
          }
        })
        //req.session.Logged2f2In = true;
        //res.redirect('/home');               
      } else {        
        res.render('2f2login', { title: '2F2 Login', IsError: true, ErrorDescription: "Please enter valid OTP."});
      }
    });    
  } catch (error) {    
    res.render('2f2login', { title: '2F2 Login',IsError: true, ErrorDescription: error.message });
  }  
};

async function checkUniqueUserName() {
  let userlist = await models.User.findAll({raw: true});

}

module.exports = userController;
