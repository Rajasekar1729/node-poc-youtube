const uuidv4 = require('uuid/v4');
const nodemailer = require("nodemailer");
const models = require("../models");
let userController = {};

// Show list of users
userController.list = (req, res) => {
  const user = models.User.findAll({
    raw: true
  }).then(function(users) { 
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
          generateOTP(users[0],res, "index");          
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
    if(dataObj != undefined && dataObj.length == 0) {
      console.log(err);
      res.render("../views/createAccount");
    } else {
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

function sendMail(toMailId, subject, html, newUuid, res, page) {
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
      if(page == "index") {
        res.render('index', { title: 'Login',IsError: true, ErrorDescription: error.message });
      } else if(page == "forget") {
        res.render('forget-password', { title: 'Forget Password', IsError: true, ErrorDescription: error.message });
      }
    
    } else {  
        if(page == "index") {
          res.redirect('/2f2-login/' + newUuid);
        } else if(page == "forget") {
          res.redirect('/reset-password/' + newUuid);
        }
    }
  });
}

// Function to generate OTP 
function generateOTP(user,res, page) { 
  let string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
  let OTP = ''; 
  let len = string.length;
  for (let i = 0; i < 6; i++ ) { 
      OTP += string[Math.floor(Math.random() * len)]; 
  } 

  let newUuid = uuidv4();
  
  let subject = "OTP";
  
  if(page == "index") {
    subject = "OTP for Login";
  } else if(page == "forget") {
    subject = "OTP for Reset Password";
  }

  let content = "Test Mail";

  if(page == "index") {
    content = "<div><p>Hi " + user.firstname + " " + user.lastname +",</p><p><b>" + OTP + "</b> is the One Time Pasword(OTP) for your login. Valid only for this login.</p><p><a href='http://localhost:3000/2f2-login/"+ newUuid +"'>Click here to login</a></p><div>"
  } else if(page == "forget") {
    content = "<div><p>Hi " + user.firstname + " " + user.lastname +",</p><p><b>" + OTP + "</b> is the One Time Pasword(OTP) for your reset password. Valid only for this Reset Password.</p><p><a href='http://localhost:3000/reset-password/"+ newUuid +"'>Click here to Reset Password</a></p><div>"
  }

  if(page == "index"){
    let request = {
      uuid: newUuid,
      user_id: user.id,
      otp: OTP
    }
    models.OTPEntries.create(request).then(function(otpEntryEntity) {
      const dataObj = otpEntryEntity.get({plain:true})
      sendMail(user.email, subject, content, newUuid,res, page);
    });
  } else if(page == "forget") {
    let request = {
      uniqueId: newUuid,
      user_id: user.id,
      otp: OTP
    }
    models.OTPResetPassword.create(request).then(function(otpResetEntity) {
      const dataObj = otpResetEntity.get({plain:true})
      sendMail(user.email, subject, content, newUuid,res, page);
    });
  }
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
        //req.session.destroy();
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

userController.usernameValidation = async (req, res) => {
  const isValid = await isValidUsername(req.params.id);
  if(isValid == true) {
    res.send({ isError: false , errorDescription: '' });
  }
  else {
    res.send({ isError: true , errorDescription: 'Username Already Exist.' });
  }
};

userController.isCheckUserAcitve = async (userId) => {
  let users = await models.User.findAll({raw: true, where: {id: userId}});
  if(users.length > 0 && users[0].isActive == true) {
      return true;
  }
  return false;
};

async function isValidUsername(username) {
  let userlist = await models.User.findAll({raw: true});
  let filterUsername = userlist.filter((user) => {
    if(user.username == username) {
      return user;
    }
  });

  return (filterUsername.length > 0) ? false : true;
}

userController.forgetPassword = async (req, res) => {
  let users = await models.User.findAll({raw: true, where: { email: req.body.email }});
  if(users.length > 0) {
    req.session.LoggedIn = users[0];
    generateOTP(users[0],res, "forget"); 
  } else {
    res.render('forget-password', { title: 'Forget Password', IsError: true, ErrorDescription: "Unable to Reset Password Please vaild E-mail."});
  }
};

// Show list of users
userController.loadResetPassword = (req, res) => {
  try {  
    models.OTPResetPassword.findAll({
      raw: true,
      where: {
        uniqueId: req.params.id
      }
    }).then(function(dataObj) {               
      if(dataObj.length > 0) {        
        models.OTPResetPassword.findAll({
          raw: true,
          where: {
            user_id: dataObj[0].user_id
          },
          order: [
            ['createdAt', 'DESC']
        ],
        }).then(function(listById) {
          if(listById.length > 0 && listById[0].uniqueId == req.params.id) {
            const user = models.User.findAll({
              raw: true,
              where: {
                id: dataObj[0].user_id
              }
            }).then(function(users) {            
              if(users.length > 0) {                  
                if(users[0].isActive == true) {
                  req.session.LoggedIn = users[0];
                  res.render('reset-password', { title: 'Reset Password', IsOTPValidated: false, ErrorDescription: ''})          
                } else {
                  res.render('reset-password', { title: 'Reset Password', IsOTPValidated: false, ErrorDescription: 'OTP is Expired'});
                }        
              } else {        
                res.render('reset-password', { title: 'Reset Password', IsOTPValidated: false, ErrorDescription: 'OTP is Expired'});
              }
            });   
            
          } else {
            res.render('reset-password', { title: 'Reset Password', IsOTPValidated: false, ErrorDescription: 'OTP is Expired'})
          }
        })             
      } else {        
        res.render('reset-password', { title: 'Reset Password', IsOTPValidated: false, ErrorDescription: "Please enter valid OTP."});
      }
    });    
  } catch (error) {    
    res.render('reset-password', { title: 'Reset Password', IsOTPValidated: false, ErrorDescription: error.message });
  }  
};

//  OTP Reset validation
userController.validateOTPResetPaasword = (req, res) => {
  try {  
    const user = models.OTPResetPassword.findAll({
      raw: true,
      where: {
        otp: req.body.otpPassword
      }
    }).then(function(dataObj) {            
      if(dataObj.length > 0) {
        res.render('reset-password', { title: 'Reset Password', IsOTPValidated: true,  ErrorDescription: ""});               
      } else {       
        res.render('reset-password', { title: 'Reset Password', IsOTPValidated: false,  ErrorDescription: "Please enter valid OTP."});
      }
    });    
  } catch (error) {    
    res.render('reset-password', { title: 'Reset Password', IsOTPValidated: false,  ErrorDescription: error.message });
  }  
};

// Update an user
userController.resetPassword = (req, res) => {
  models.User.update({ password: req.body.password }, { raw: true,
    where: {
      id: req.session.LoggedIn.id
    }
  }).then(function(user) {
    if (user != undefined && user.length == 0) {
      console.log(err);
      res.render('reset-password', { title: 'Reset Password', IsOTPValidated: true, ErrorDescription: "Please try again later"});
    } else {
      req.session.destroy();
      res.redirect("/");
    }    
  });
};



module.exports = userController;
