const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//auth
exports.auth = async (req, res, next) => {
  try {
    // extarct token
    const token =
      req.body.token ||
      req.cookies.token ||
      req.header("Authorization").replace("Bearer ", "");

    // if tocken missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token Missing",
      });
    }

    //verify the token

    console.log("token",token)

    try {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);

      req.user = decode; // here we add this decoded token in req body
      // for ferther middle ware checking
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid ",
      });
    }
    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Somthing went wrong while validating the Token",
    });
  }
};



//is student

exports.isStudent =(req,res,next)=>
{
    try {
        const userType = req.user.role;
        //here req.user.role added in auth middle ware 

        //check role match with student 
        if(userType!=="Student"){
            return res.status(401).json({
                success: false,
                message: "This is a protected Route for Student other than student not allowed ",
              });
        }

        next();
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "user role can not be verified , please try again",
          });
        
    }

}


// is Instructor

exports.isInstructor =(req,res,next)=>
{
    try {
        const userType = req.user.role;
        //here req.user.role added in auth middle ware 

        //check role match with student 
        if(userType!=="Instructor"){
            return res.status(401).json({
                success: false,
                message: "This is a protected Route for Instructor other than instructor not allowed ",
              });
        }

        next();
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "user role can not be verified , please try again",
          });
        
    }

}

// is Admin
exports.isAdmin =(req,res,next)=>
{
    try {
        const userType = req.user.role;
        //here req.user.role added in auth middle ware 

        //check role match with Admin 
        if(userType!=="Admin"){
            return res.status(401).json({
                success: false,
                message: "This is a protected Route for Admin other than Admin not allowed ",
              });
        }

        next();
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "user role can not be verified , please try again",
          });
        
    }

}
