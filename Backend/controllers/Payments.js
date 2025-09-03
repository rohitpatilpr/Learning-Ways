//import
const User = require("../models/User");
const Course = require("../models/Course");
const { instance } = require("../config/razorpay");
const {mailSender} = require("../utils/mailSender");
const mongoose = require("mongoose");
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress");
const { courseEnrollmentEmail } = require("../MailFormat/courseEnrollmentMail");


// Capture Payment 
// this is new code that create the pay ment for all course in cart

exports.capturePayment= async (req,res)=>{

  const {courses}= req.body
  const userId= req.user.id

  if(courses.length===0)
  {
    return res.json({success:false, message:"Please Provide Course Id"})
  }
  
  // calculate total amount amount to taht payable 

  let totalAmount =0

  for (const course_id of courses)
  {
    let course ;
    try {
      course= await Course.findById(course_id);
      if(!course)
      {
        return res.status(200).json({success:false, message:"Could not find course"})
      }
      const uid = new mongoose.Types.ObjectId(userId);

      if(course.studentEnrolled.includes(uid))
      {
        return res.status(200).json({success:false , message:"User already enrolled"})
      }

      totalAmount +=course.price;

      
    } catch (error) {
      console.log(error)
      return res.status(500).json({success:false, message:error.message})
    }
  }

  const options = {
    amount :totalAmount*100,
    currency:"INR",
    receipt:Math.random(Date.now()).toString()
  }

  // create order 

  try {

    const paymentResponse = await instance.orders.create(options);
    res.status(200).json({
      success:true,
      message:"Order created successfully",
      data:paymentResponse,
    })
    
  } catch (error) {

    console.log(error)
    res.status(500).json({success:false, message:"Could not Initiate Order"})
  }
}



//Verify payment or singnature  of razor pay order 

exports.verifyPayment= async (req, res)=>{

  const razorpay_order_id =req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const courses = req.body?.courses;
  const userId = req.user.id;

if(!razorpay_order_id ||
  !razorpay_payment_id||
  !razorpay_signature||
  !courses || !userId)
  {
    return res.status(401).json({success:false , message:"Payment failed"})
  }


  // adding pipe operator 
  let body = razorpay_order_id + "|" + razorpay_payment_id;
  const exceptedSignature = crypto
  .createHmac("sha256",process.env.RAZORPAY_SECRET)
  .update(body.toString())
  .digest("hex")

  if(exceptedSignature===razorpay_signature)
  {
    // enroll student to courses 
    enrollStudent(courses,userId,res)

    // return response 
    return res.status(200).json({success:true,message:"Payment Varified"})
  }

  return res.status(500).json({success:false, message:"Final payment Failed"})


}

// this function enroll student in course and add course in enrolled student 
const enrollStudent = async (courses, userId, res)=>{

  if(!courses || ! userId)
  {
    return res.status(404).json({success:false, message:"Please provide data for Courses or coureId"})
  }

  for(const course_id of courses)
  {
    try {
      // update course 
    const enrolledCourse = await Course.findByIdAndUpdate(
      {_id:course_id},
      {$push:{studentEnrolled:userId}},
      {new:true}
      )


      if(!enrolledCourse){

            return res.status(404).json({success:false, message:"Course not founnd"})

      }
        // add this booth enrolled student and course in course progress 
      // to create course pronress 
     const courseProgress= await CourseProgress.create({
        courseId:enrolledCourse._id, 
        userId:userId,
        completedVideos:[]})

      // update Student 

      const enrolledStudent = await User.findByIdAndUpdate(
        {_id:userId},
        {$push:{
          courses:course_id,
       courseProgress:courseProgress._id}},
       
        {new:true}
      )

    

      // send mail to student 

      
      const mailResponce = await mailSender(enrolledStudent.email,`Successfully Enrolled into ${enrolledCourse.courseName}`,
      courseEnrollmentEmail(
        enrolledCourse.courseName,
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
      ));
      console.log("Email sent Successfully",mailResponce)
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({success:false, message:error.message})
      
    }


  }

}

//Send successfully pay ment email to student 

exports.sendPaymentSuccessEmail = async (req, res)=>{
  const {orderId,paymentId, amount} = req.body;
  const userId = req.user.id;
  if(!userId|| !orderId || !paymentId || !amount)
  {
    return res.status(400).json({success:false, message:"Please Fill All Fields "})
  }

  console.log("Pay email")

  try {

    // find user 
    const enrolledStudent = await User.findById(userId)
     
    const email = enrolledStudent.email;
    // send mail 
   const res = await mailSender(
      email,"Payment Recived", `name: ${enrolledStudent.firstName} ${enrolledStudent.lastName} \n PaymentId : ${paymentId} \n orderId: ${orderId} \n Amount : ${amount}`
    )
    console.log("email res", res)
  } catch (error) {
    console.log(error)
    return res.status(500).json({success:false, message:"could not send mail"})
    
  }

}
