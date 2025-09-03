//Reset Password Token
const User = require("../models/User");
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const { mailSender } = require("../utils/mailSender");
const {resetPassword} = require("../MailFormat/resetPassword")
require("dotenv").config();

exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from body
    const email  = req.body.email;
   

    //check mail
    if (!email) {
        return res.status(401).json({
            success: false,
            message: "Email missing",
          });
    }
    //check user for this mail
    const user = await User.findOne({ email});

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "User not Found",
          });
    }

    //genarate token
    // this create the random number that can use as token
    const token = crypto.randomUUID();

    //update the user adding token and expiration time
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true } // for geting updated information
    );
    //create url
    // this is front end url
    const url = `http://localhost:3000/update-password/${token}`;

    // send mail with link
    await mailSender(
      email,
      "Reset Your Password",
      resetPassword(email,url)
      
    );

    // return response
    res.status(200).json({
      success: true,
      message: "Mail Send Successfully, check mail",
    });
  } catch (error) {

    console.log(error);

    return res.status(500).json({
        success: false,
        message: "Failed to reset Password, Try again",
      });


  }
};

//reset password

exports.resetPassword = async (req,res) =>{
    try {
        // fetch data
    const {password, confirmPassword , token} = req.body; // here token send by front end 
    // validate 
    if(password!==confirmPassword)
    { 
        return res.status(401).json({
            success: false,
            message: "Password and ConfirmPassword not match ",
          });

    } 

    //get user entry fron database 
    const user = await User.findOne({token:token});
    if(!user)
    {
        return res.status(401).json({
            success: false,
            message: "Token Invalid",
          });

    }
    // validate time of expire of token
    if(user.resetPasswordExpires< Date.now())
    {
        return res.status(401).json({
            success: false,
            message: "Sesion Expire!!",
          });

    }
    // hash password 
    const hashedPass = await bcrypt.hash(password,10);
    // update this hashed password 
    await User.findOneAndUpdate({token:token},{
        password:hashedPass
    })
    //return response
    res.status(200).json({
        success:true,
        message:"Password Reset Successfully",
    })

        
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Failed to reset Password , Try again",
          });
        
    }

    }
