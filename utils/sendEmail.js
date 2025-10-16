const nodemailer = require("nodemailer");

module.exports = async(userEmail , subject , htmlTemplate)=>{
  try{
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth:{
        user:process.env.EMAIL,
        pass:process.env.EMAIL_PASSWORD
      }
    })
    const mailOptions={
        from: '"facebook app" <' + process.env.EMAIL + '>',
        to: userEmail,
        subject: subject,
        html: htmlTemplate,
    }
      const info = await transporter.sendMail(mailOptions);
  }catch(error){
    throw new Error("Internal Server Error (nodemailer)")
  }
}






// const sendEmail = async function (options) {
//   options = options || {};
//   const to = options.to || [];
//   const cc = options.cc || [];
//   const bcc = options.bcc || [];
//   const subject = options.subject || "Route";
//   const text = options.text || "";
//   const html = options.html || "";
//   const attachments = options.attachments || [];

//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   const info = await transporter.sendMail({
//     from: '"facebook app" <' + process.env.EMAIL + '>',
//     to: to,
//     cc: cc,
//     bcc: bcc,
//     subject: subject,
//     text: text,
//     html: html,
//     attachments: attachments
//   });

//   return info;
// };

// module.exports = { sendEmail };
