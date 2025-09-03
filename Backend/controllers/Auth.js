
//import 
const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile =require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


//send OTP

exports.sendOTP = async (req,res)=>{
    try {
        //fetch email from request body  
        const {email}= req.body;

        const userPresent= await User.findOne({email});

        //User alrady exist 
        if(userPresent)
        {
            return res.status(401).json({
                success:false,
                message:"User Already Exist !!"
            })
        }

        // generate the otp 

       const responce =  await OTP.deleteMany({email:email})


        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,

        });

        // check the otp is unique or not 
        // this is very bad practice because here we call Data base number of times 
        // to avoid this you can use unique otp generator library 
        // const result = await OTP.findOne({otp:otp});

        // while(result)
        // {
        //     otp = otpGenerator.generate(6,{
        //         upperCaseAlphabets:false,
        //         lowerCaseAlphabets:false,
        //         specialChars:false,
    
        //     });
        // }

        const otpPayload = {email,otp}
        
        const otpBody = await OTP.create(otpPayload)

        // store this otp in DB to for checking while sign up 
    

        // send responce 
        res.status(200).json({
            success:true,
            message:"OTP send Successfully", 
            otp
        })
        
        
    } catch (error) {

        console.log("Error occured whule Sending otp :",error);
        console.error;
        res.status(500).json({
            success:false,
            message:error.message
        })
        
        
    }

}


// signUp

exports.signUp= async (req,res)=>
{
    try {
        //data fetch fron request of body
        const {firstName, 
        lastName,
        email,
        password,
        confirmPassword, 
        accountType,
        // phone,
        otp 
         } =req.body;


        //validatation 
        if(!firstName|| !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(401).json({
                success:false,
                message:"Fill all Fields Properly"
            })
        }



        //check user alrady exist 
        if(await  User.findOne({email})){
            return res.status(400).json({
                success:false,
                message:"User Already Register !!"
            })

        }


        //match password and confirm password
        if(password!==confirmPassword)
        {
            return res.status(400).json({
                success:false,
                message:"password and confirm password not matching"
            })

        }
 
        //find most recent OTP stored for the user 
        // the below statement find the most resent otp of matched email 
        // here findOne finds email
        // sort -> sort the all enties by createdAt parameter with desending order 
        // limit -> return only one entry that is most resent 

        const resentOTP = await OTP.findOne({email}).sort({createdAt:-1}).limit(1);


        //validate otp
        if(resentOTP.length==0)
        {
            //otp not found 
            return res.status(400).json({
                success:false,
                message:"OTP not found "
            })
        }
        else if(otp!==resentOTP.otp)
        {
            // invalid otp 
            return res.status(400).json({
                success:false,
                message:"Invalid otp !!"
            })

        }

        //hash Password 
        const hashedPass = bcrypt.hash(password,10);

        //create the profile to store its id in user 
        const profile = await Profile.create({
            gender:null,
            DOB:null,
            about:null,
            contact:null,
        })

         //create entry in data base
        const userData = await User.create({
            firstName,
            lastName,
            email,
            password:(await hashedPass).toString(),
            accountType,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
            additionalDetails:profile._id,    
        })
        //return responce 
        res.status(200).json({
            success:true,
            message:"User Registration Done Successfully", 
            userData
        })

        
    } catch (error) {

        console.log("Error occured whule register user :",error)
        res.status(500).json({
            success:false,
            message:error.message
        })
        
        
        
    }
}


//login

exports.login = async (req,res)=>{
    try {
        // get data from user
        const {email, password} =req.body;
        //validate data 
        if(!email ||  !password)
        {
            return res.status(401).json({
                success:false,
                message:"Fill all Fields Properly"
            });
            
        }


        // check user is exist or not 
        const user = await User.findOne({email}).populate("additionalDetails");

        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"User doesn't exist"
            });
        }



        
        //generate jwt after password match 
        if(await bcrypt.compare(password,user.password)){

            const payload ={
                email:user.email,
                id:user._id,
                role:user.accountType,
            }

            const token = jwt.sign(payload,process.env.JWT_SECRET,{

                expiresIn:"24h"
            });


            
                //insert the token in user 
                user.token = token;
                //remove password from user instance in tocken 
                user.password=undefined;



                // // create cookie and send responce 

                const option={
                    expire:new Date(Date.now() + 3*24*60*60*1000), // 3days expire 
                    httpOnly:true
                 } 

                res.cookie("token",token,option).status(200).json({
                    success:true,
                    token,
                    user,
                    message:"Logged in successfully"

                })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password doesn't match"
            });
        }


        

        
    } catch (error) {
        console.log("Login failure error :",error)
        return res.status(500).json({
            success:false,
            message:"Login failure , please try again",
        });
    }

}

 

//change Password 
