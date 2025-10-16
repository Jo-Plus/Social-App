const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail.js');
const confirmEmailTemplate = require('../utils/confirmEmailTemplate.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, validationRegisterUser, validationLoginUser } = require("../models/User");
const { VerificationToken } = require('../models/verificationToken.js');


module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  // validation
  const { error } = validationRegisterUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // is user already exists
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: 'user already exist' });
  }

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // new user and save it to DB
  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword
  });

  await user.save();
  //==========================================================
  // TODO sending email (verify account) ==> after frontend
  // creating new verificationToken & save it in DB
  const verificationToken = new VerificationToken({
    userId:user._id,
    token:crypto.randomBytes(32).toString("hex")
  })
  await verificationToken.save();
  //making the link
  const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`
  //putting the link into an html template
  const htmlTemplate = confirmEmailTemplate({
    username: User.username,
    link,
  });
  //sending email to the user
  await sendEmail(user.email , 'Verify your email' , htmlTemplate)
  //==========================================================

  // send a res to client ==>before sending email (verify account)
  // res.status(201).json({ message: 'you registered successfully' });
  // send a res to client ==>after sending email (verify account)
  res.status(201).json({ message: 'we send to you an email , please verify your email address' });
});


module.exports.loginUserCtrl = asyncHandler(async (req,res) =>{
  // validation
  const { error } = validationLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  //is user exist
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: 'user not exist' });
  }
  //check the password
  const isPasswordMatch = bcrypt.compareSync(req.body.password , user.password);
  if (!isPasswordMatch) {
    return res.status(404).json({ message: "In-Valid email or password" });
  }
  //==========================================================
  // TODO sending email (verify account if not verified) ==> after frontend
  if(!user.isAccountVerified){
    let verificationToken = await VerificationToken.findOne({
      userId : user._id,
    })
    if(!verificationToken){
      verificationToken = new VerificationToken({
        userId: user._id,
        token : crypto.randomBytes(32).toString("hex")
      });
      await  verificationToken.save();
    }
  //making the link
  const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`
  //putting the link into an html template
  const htmlTemplate = confirmEmailTemplate({
    username: user.username,
    link,
  });
  //sending email to the user
  await sendEmail(user.email , 'Verify your email' , htmlTemplate)
  return res.status(200).json({ message: "We sent you an email, please verify your email address." });
  }
  //==========================================================
  //generate token
  const token = user.generateAuthToken();
  //response to client
  res.status(200).json({
    _id:user._id,
    isAdmin:user.isAdmin,
    profilePhoto:user.profilePhoto,
    token,
  })
});


// TODO verify user account ==> after frontend
module.exports.verifyUserAccountCtrl = asyncHandler(async (req,res) =>{
  const user = await User.findById(req.params.userId);
  if(!user){
    return res.status(400).json({message:"invalid Link"})
  }
  const verificationToken = await VerificationToken.findOne({
    userId:user._id,
    token:req.params.token,
  })
  if(!verificationToken){
    return res.status(400).json({message:"invalid Link"})
  }
  user.isAccountVerified = true;
  await user.save();
  await verificationToken.remove();
  res.status(200).json({message:"your account verified"});
})