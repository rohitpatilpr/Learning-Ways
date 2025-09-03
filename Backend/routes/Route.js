
// import 
const express = require("express");
const router = express.Router();

// import all handler 
const {sendOTP,signUp,login} =require("../controllers/Auth");
const {createCategory, getAllCategory,categoryPageDetails}=require("../controllers/Category");
const {contactUs}=require("../controllers/ContactUs");
const {createCourse,getAllCourse,getFullCourseDetails, UpdateCourse, deleteCourse, getInstructorCourses, dummy, getCourseDetails}=require("../controllers/Course");
const {capturePayment,verifySignature, verifyPayment, sendPaymentSuccessEmail}=require("../controllers/Payments");
const {updateProfile,deleteAccount,getAllUser, getEnrolledCourses, updateDisplayPicture, changePassword, instructorDashboard}=require("../controllers/Profile");
const {createRating,averageRating,courseRating,getAllReating}=require("../controllers/Rating");
const {resetPasswordToken,resetPassword}=require("../controllers/ResetPassword");
const {createSection,UpdateSection,deleteSection}=require("../controllers/Section");
const {createSubSection,updateSubSection,deleteSubSection}=require("../controllers/SubSection");
const { updataeCourseProgress } = require("../controllers/CoursePrgress");
const {testing} =require("../utils/testing");


//testing
router.post("/testing",testing);



// import middleware 
const {auth, isStudent, isInstructor, isAdmin} = require("../middlewares/auth");

//********************************************************************************************************************
//********************************************************************************************************************
//                                              USER ROUTER
//********************************************************************************************************************
//********************************************************************************************************************



//********************************************************************************************************************
//                                            Authentication routes
//********************************************************************************************************************

//User login 
router.post("/auth/login",login);

//User signUp
router.post("/auth/signup",signUp)

//Sendning otp to user mail
router.post("/auth/sendotp",sendOTP);

//Change Password 

//********************************************************************************************************************
//                                             Reset Password 
//********************************************************************************************************************

//Geneteate password token 
router.post("/auth/reset-password-token",resetPasswordToken);

//Reset password 
router.post("/auth/reset-password",resetPassword);


//********************************************************************************************************************
//********************************************************************************************************************
//                                              COURSE ROUTER 
//********************************************************************************************************************
//********************************************************************************************************************



//********************************************************************************************************************
//                                              Course Routes 
//********************************************************************************************************************

//This route only for instructor 

//Create course 
router.post("/course/createCourse", auth, isInstructor, createCourse);

//update course 
router.post("/course/updateCourse", auth, isInstructor, UpdateCourse);

// Geting course details 
// Get all course 
router.get("/course/getAllCourses",getAllCourse);

// get course details for un logged user 
router.post("/course/getCourseDetails",getCourseDetails)

// Get details of perticularr course  fot authenticate user 
router.post("/course/getFullCourseDetails",auth,getFullCourseDetails);

//Get Instructor Courses 
router.get("/course/getInstructorCourses",auth,isInstructor,getInstructorCourses)

// delete course 
router.delete("/course/deleteCourse",deleteCourse);

// To update coure Progress 
router.post("/course/updateCourseProgress",auth, isStudent, updataeCourseProgress)


//********************************************************************************************************************
//                                              Section And Subsection 
//********************************************************************************************************************

//Add section 
router.post("/course/addSection", auth, isInstructor,createSection);

//Update section 
router.post("/course/updateSection", auth, isInstructor, UpdateSection);

//Delete section
router.post("/course/deleteSection", auth, isInstructor,deleteSection);


//Add subsectin in to section 
router.post("/course/addSubSection", auth, isInstructor,createSubSection);

//Edit subsection 
router.post("/course/updateSubSection", auth, isInstructor,updateSubSection);

//Delete SubSection
router.post("/course/deleteSubSection", auth, isInstructor,deleteSubSection);






//********************************************************************************************************************
//                                              Category Routes (only for Admin)
//********************************************************************************************************************

// category can only be created by Admin
//Create category 
router.post("/course/createCategory",auth,isAdmin,createCategory);

//ShowAll category 
router.get("/course/showALLCategories", getAllCategory);

//Get categorypage details 
router.post("/course/getCategoryPageDetails",categoryPageDetails)




//********************************************************************************************************************
//                                               Rating and Review
//********************************************************************************************************************

//Create raeting 
router.post("/course/createRating", auth, isStudent, createRating)

//Get average rating 
router.get("/course/getAverageRating", averageRating)

// Get all reviews 
router.get("/course/getAllReviews", getAllReating)

//Get reating for perticular course 
router.get("/course/getCourseRating",courseRating)



//********************************************************************************************************************
//                                               Profile Route
//********************************************************************************************************************

//Update profile
router.put("/profile/updateProfile", auth,updateProfile)

//Get User datils 
router.get("/profile/getUserDetails", auth,getAllUser);

// Delete acount 
router.delete("/profile/deleteAccount",auth,deleteAccount)

// Get enrolled courses 
router.get("/profile/getEnrolledCourses", auth,getEnrolledCourses);

//Updated display picture 
router.put("/profile/updatedProfilePicture", auth,updateDisplayPicture)

// Change password 
router.put("/profile/changePassword", auth,changePassword)

//instructor Statistics 
router.get("/profile/instructorDashboard",auth,isInstructor,instructorDashboard)


//Contact Us 
router.post("/profile/contactUs",contactUs)

//********************************************************************************************************************
//                                               Payment Route
//********************************************************************************************************************

//Capture Payment 
router.post("/payment/capturePayment", auth, isStudent, capturePayment)

//Verify signiture 
router.post("/payment/verifyPayment",auth,isStudent, verifyPayment)

//aend payment success mail
router.post("/payment/sendPaymentSuccessMail",auth,isStudent,sendPaymentSuccessEmail)





module.exports = router
