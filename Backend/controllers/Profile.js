
const { mongoose } = require("mongoose");
const Profile = require("../models/Profile");
const User = require("../models/User");
const {imageUploader} = require("../utils/imageUploader");
const { response } = require("express");
const bcrypt = require("bcrypt");
const { populate } = require("../models/Course");
const { convertSecondsToDuration } = require("../utils/secTduration");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const { passwordUpdated } = require("../MailFormat/passwordUptate");
const { mailSender } = require("../utils/mailSender");



exports.updateProfile = async (req, res)=>{
    try{
  /*  Rquired steps to update section

          1. Fetch data from body. 
          2. Validate the fetched data.
          3. User detail from req.user
          4. Get profile id from userDetails. 
          5. Get profile details using profile id 
          4. Update the Profile.
          5. Send positive response.
          6. Otherwise send negative response.
    */

    //Fetch data from body.

        
    const {gender, DOB="", about="", contact} = req.body;
    const userId =req.user.id; 
    console.log(userId);

    //Validate the fetched data.
    if (!gender|| !contact || !userId) {
     return res.status(401).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    //Get User detail from req.user 
    const userDetails = await User.findById(userId) ;

    //Get profile details from userDetails 
     const profileId = userDetails.additionalDetails;
     const profileDetails = await Profile.findById(profileId);
 
    //Update Profile.
    profileDetails.gender=gender;
    profileDetails.DOB= DOB;
    profileDetails.about=about;
    profileDetails.contact=contact;

    await profileDetails.save();
    const updatedUser= await User.findById(userId).populate("additionalDetails");

    // Send Positive response
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
       updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Profile ",
    });
  }
};


//delete the acount 
exports.deleteAccount = async (req, res)=>{
    try{ 

 /*  Rquired steps to delete section

          1. Get id from req.user.id
          2. Validate the fetched data.
          3. First of all delete the profile 
          4. Then delete count from total studend enrolled.
          5. Finaly delete the User acount 
          6. Send positive response.
          7. Otherwise send negative response.
    */

    //Fetch data from req.usr .
      
       const userId = req.user.id;
       console.log(userId);

    //    2. Validate the fetched data.
      const userDetails = await User.findById(userId);
      if(!userDetails)
      {
        return res.status(401).json({
            success:false,
            message:"user not found",
        })
      }

    //    3. First of all delete the profile 
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
    /////// HW    4. Then delete count from total student enrolled.

    //    5. Finaly delete the User acount 
      const daletedAccount=  await User.findByIdAndDelete({_id:userId});
   
       // Send Positive response
       return res.status(200).json({
         success: true,
         message: "Acount deleted successfully",
        deleteAccount:this.deleteAccount
       });
     } catch (error) {
       console.log(error);
       return res.status(401).json({
         success: false,
         message: "Failed to delete acount",
       });
     }
   };
   



   // get all User 

exports.getAllUser = async (req,res)=>{

    try {

        /*  Required Steps to get all users
        1. Get id
        2. Fetch databy id 
        3. return response
        */

        // 1. Get id
           const id = req.user.id;
        // 2. Fetch databy id 
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        
  // Send Positive response
  return res.status(200).json({
    success: true,
    message: "User data fetched successfully",
    data:userDetails
  
  });
} catch (error) {
  console.log(error);
  return res.status(401).json({
    success: false,
    message: "Failed Fetch user details",
  });
}
};


// when user update yhere profie picture 

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId =req.user.id 
    // const userId= 4555
    console.log("image " ,displayPicture)
    console.log(userId)
    const image = await imageUploader(
      displayPicture,
      `${process.env.FOLDER_NAME}/Profile`,
      1000,
      1000
    )
    console.log(image)
    console.log(image.secure_url)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    ).populate("additionalDetails")
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};


// change Password 

exports.changePassword = async (req, res)=>
{
  try {

    /**
     required steps to change password 
     1. get password and conform password from req 
     2. validate data
     3. chack password and corrent password is match 
     4. hash the password 
     5. update the new password in database 
     6. send responce 

     */

     const {password, confirmPassword} = req.body;
     const userId = req.user.id;

     if(!password || !confirmPassword || !userId)
     {
      return res.status(401).json({
        success:false,
        message: "Please enter password and confirmPassword both"
      })
     }

     if(password!==confirmPassword)
     {
      return response.status(401).json({
        success:false,
        message: "password and confirmPassword not match "
      })
     }

     const hashedPassword = await bcrypt.hash(password,10);

     const updatedUser = await User.findByIdAndUpdate({_id:userId},
      {password:hashedPassword},{new:true})


      // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUser.email,
        "Password for your account has been updated",
       passwordUpdated(
        updatedUser.email,
        `Password updated successfully for ${updatedUser.firstName} ${updatedUser.lastName}`
       )
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }


      res.status(200).json({
        success:true,
        message:"Password changed successfully"
      })

    
  } catch (error) {

    console.log(error)
    return res.status(500).json({
      success:false,
      message:"Fail to change Password"
    })
    
  }
}

// the get ALL enrolled course 
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path:"courses",
        populate:{
          path:"courseContent",
          populate:{
            path:"subSection"

          },
        },

      })
      .exec()

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }




    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {

      let totalDurationInSeconds = 0
      SubsectionLength = 0

      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.duration), 0)

        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )

        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      
      let courseProgressCount = await CourseProgress.findOne({
            courseId:userDetails.courses[i]._id,
            userId:userId,
    
          })
      console.log("coursePC",courseProgressCount)

      courseProgressCount = courseProgressCount?.completedVideos.length
      // courseProgressCount = 1
      
      console.log("courseProgressCount",courseProgressCount)
      console.log("SubsectionLength",SubsectionLength)
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier

         
      }
    }


    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};



// the Statistic for Instructor 
exports.instructorDashboard = async (req, res )=>{

  const userId = req.user.id
  try {
    const courseDetails = await Course.find({instructor:userId})

    const coureData= courseDetails.map((course)=>{
      const totalEnrolledStudent = course.studentEnrolled.length
      const totalUrning = totalEnrolledStudent*course.price

      // create one object to store the all required info

      const courseSatatistics = {
        _id:course._id,
        courseName : course.courseName,
        courseDescription :course.courseDescription,
        totalEnrolledStudent,
        totalUrning
      }

      return courseSatatistics


    })
    res.status(200).json({courses:coureData,success:true})
    
  } catch (error) {
    console.log(error)
    res.status(500).json({message:"intrernal server errorr",success:false} )
    
  }
}