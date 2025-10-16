const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail.js');
const confirmEmailTemplate = require('../utils/confirmEmailTemplate.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User , validationNewPassword , validationEmail } = require("../models/User");
const { VerificationToken } = require('../models/verificationToken.js');


//send reset password link
module.exports.sendResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
  //validation
  const { error } = validationEmail(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  //get the user from DB by email
  const user = await User.findOne({email:req.body.email});
  if(!user){
    return res.status(404).json({message:"user with given email does not exist!"})
  }
  //creating verificationToken
  let verificationToken = await VerificationToken.findOne({userId : user._id});
  if(!verificationToken){
    verificationToken = new VerificationToken({
      userId:user._id,
      token:crypto.randomBytes(32).toString("hex")
    })
    await verificationToken.save();
  }
  //creating link
  const link = `${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;
  //creating html template
  const htmlTemplate = confirmEmailTemplate({
  username: user.username,
  link,
  });
  //sending email
  await sendEmail(user.email , 'reset password' , htmlTemplate)
  //res to the client
  return res.status(200).json({ message: "password reset link sent to your email , please check your inbox" });
})


//get reset password link
module.exports.getResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if(!user){
    return res.status(400).json({ message: "Invalid or expired link." });
  }
  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token:req.params.token
  })
  if(!verificationToken){
    return res.status(400).json({ message: "Invalid or expired link." });
  }
  res.status(200).json({message:"valid url"})
})


// reset password
module.exports.resetPasswordCtrl = asyncHandler(async (req, res) => {
  //validation
  const { error } = validationNewPassword(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  //get the user from DB by email
  const user = await User.findById(req.params.userId)
  if(!user){
    return res.status(400).json({ message: "Invalid or expired link." });
  }
  const verificationToken = await VerificationToken.findOne({
    userId:user._id,
    token:req.params.token
  })
  if(!verificationToken){
    return res.status(400).json({ message: "Invalid or expired link." });
  }
  if(!user.isAccountVerified){
    user.isAccountVerified = true;
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  user.password = hashedPassword;
  await user.save();
  await verificationToken.remove();
  res.status(200).json({message:"password reset successfully , please login"});
})