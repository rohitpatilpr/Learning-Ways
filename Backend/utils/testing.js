
const mailSender = require("./mailSender");
const nodemailer = require("nodemailer")
require("dotenv").config()

exports.testing = async (req,res)=>{
    try {
        let mail = req.body;
        console.log(mail)
        mail=mail.toString()
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          });
          
          let info = await transporter.sendMail({
              from:'Learning Ways',
              to:`${mail}`,
              subject:`test`,
              html:`xyz`,
          })
      

        // await mailSender(mail, "test", "testing mail");

        res.json({
            message:"mail sended"
        })
        
    } catch (error) {
        console.log(error);
        console.log("error message :", error.message);
        return  res.json({
            message:"mail not sended"
        })
        
    }
}

