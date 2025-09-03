// import
const mongoose = require("mongoose");
const { mailSender } = require("../utils/mailSender");
const otpTemplate = require("../MailFormat/emailVarification");

const OTPSchema = new mongoose.Schema({
  
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
createdAt: {
    type: Date,
    required: true,
    default:Date.now(),
  },

 
});

// To send the mail for otp
async function sendMailToVarification(email,otp)
{
    try {
        const mailResponce = await mailSender(email, "Varification Email",
        otpTemplate(otp));
        console.log("Email sent Successfully",mailResponce)
        
    } catch (error) {
        console.log("Error occured while sending mail");
        throw error;
        
    }
}

OTPSchema.pre("save",async function(next){
    await sendMailToVarification(this.email,this.otp);
    next();
})

  


module.exports = mongoose.model("OTP",OTPSchema);