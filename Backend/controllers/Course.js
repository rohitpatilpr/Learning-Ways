
const { UploadStream } = require("cloudinary");
const Course = require("../models/Course");
const Category = require("../models/Category")
const User = require("../models/User")
const Reating = require("../models/Reating")
const {imageUploader} = require("../utils/imageUploader");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const CourseProgress  = require('../models/CourseProgress') 
const Catagory = require('../models/Category')
const {mongoose } = require("mongoose");
// const {convertSecondsToDuration} = require("../utils/testing")

function convertSecondsToDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor((totalSeconds % 3600) % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}


//create the new courses 

exports.createCourse = async (req, res)=>
{
    /*
     To create the course the required steps are below,

     1. Fetch the data from request body. 
     2. Get image file from request files for thumbNail.
     3. Validate Data.
     4. Find the instructor using req.use.id and validate it.
     5. Get category details and validate it.
     6. Uoload the image of thumbNail on cloudinary and get url.
     7. Create entry in Course Schema.
     8. Add this course id in instructor's courses arrray
     9. Similariy in Catagory  schema
     10. Return positive response.
     11. Otherwise return negative response
     */

    try {
        //get data from body 
        let {
            courseName, 
            courseDescription, 
            whatYouWillLearn,
            price, 
            tag:_tag ,
            category,
            status,
            instructions:_instructions
        } =req.body;
        
        // get thumbnail
        const thumbNail = req.files.thumbNailImage;
        // Convert the tag and instructions from stringified Array to Array
        console.log("ins",_instructions)
        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)
        console.log("tag", tag)
    console.log("instructions", instructions)

       //validate the data 
       if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag.length || !thumbNail || !category || !instructions.length) 
       {
        return res.status(401).json({
            success: false,
            message: "All fildes required, please fill all.",
          });

       }   

       ///////TODO is user id and insrtructorDetail._id same 

       //check the inctructor or to store the instructor info in course 
       const userId = req.user.id;     // this is comes from the previous middele ware (auth->isInstructor->...)
        //fetch the details of instructor 
        const instructorDetails = await User.findById(userId,{accountType:"Instructor"});

        //check instructor is present 

        if(!instructorDetails)
        {
            return res.status(404).json({
                success:false,
                message:"Instructor Not Found"
            });
        }

         //fetch the details of Catagory
         const categoryDetails = await Category.findById({_id:category});

         //check tag is present 
 
         if(!categoryDetails)
         {
             return res.status(404).json({
                 success:false,
                 message:"category Not Found"
             });
         }

         //upload the file on cloudinary 
         const thumbNailImage = await imageUploader(thumbNail,`${process.env.FOLDER_NAME}/ThumbNails`);

         //create the entry in Database 
         const newCourse = await Course.create({
            courseName,
            courseDescription,
            price,
            whatYouWillLearn:whatYouWillLearn,
            thumbNail:thumbNailImage.secure_url,
            instructor:instructorDetails._id,
            tag:tag,
            category:categoryDetails._id,
            status:status,
            instructions

         })


         // add the new course in users instructor course list 
         await User.findByIdAndUpdate({_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },{new:true})

        //update the Category Schema 
        await Category.findByIdAndUpdate({_id:category},
            {
                $push:{

                    course:newCourse._id,
                }

        }, {new:true})

        res.status(200).json({
            success:true,
            message:"Course created successfully",
            data:newCourse,
        })
        
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: "Failed to create a course ",
          });
        
        
    }

}

//update course 

exports.UpdateCourse = async (req,res)=>{

/*
// Required steps for to uodate course 
  1. Fetch data from body 
  2. Validate data 
  3. By using findByIdAndUpdate() function update all data 
  4. return response 
 */


  try {
        //   1. Fetch data from body 
        const {courseId} = req.body ;

        // fetch all updated value fron the req body 
        const updates= req.body

        // find the course 
        const course = await Course.findById(courseId)

        if(!course){
            return res.status(404).json({success:false, message:"Course Not found"})
        }


        // check for the thumbNail image 
        if(req.files)
        {
            console.log("thumbnail update")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await imageUploader(
              thumbnail,
              `${process.env.FOLDER_NAME}/ThumbNails`
            )
            course.thumbNail = thumbnailImage.secure_url
          }
            

          // update that things that are updated  or present in req body 
          for(const key in updates)
          {
            // hasOwnProperty means the object have it own property not inharit from parent 
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instructions") {
                  course[key] = JSON.parse(updates[key])
                } else {
                  course[key] = updates[key]
                }
              }

          }

          // save all changes 
          await course.save();
     
          // get full populated course
          const updatedCourse = await Course.findOne({
            _id: courseId,
          })
            .populate({
              path: "instructor",
              populate: {
                path: "additionalDetails",
              },
            })
            .populate("category")
            .populate("ratingAndReview")
            .populate({
              path: "courseContent",
              populate: {
                path: "subSection",
              },
            })
            .exec()
      


        res.status(200).json({
            success:true,
            message:"Course updated successfully",
            data:updatedCourse,
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Failed to upadte course ",
            error:error.message
          });
        
        
    }

}


// get the all coursese 

exports.getAllCourse = async (req, res)=>
{
    /*To get the All courses the required steps are below,

     1. By using find() method get all course Details with send all parameter true and populate instructor
     2. Return positive response.
     3. Otherwise return negative response

     */


    try {

        // Get data from the course 

         const  coursedata = await Course.find({},{
            courseName:true,
            courceContent:true,
            price:true,   
            thumbNail:true,
            instructor:true,
            ratingAndReview:true,
            category:true,
            studentEnrolled:true

         }).populate("instructor").populate("courseContent")
         .populate("ratingAndReview").populate("category").
         populate("studentEnrolled").exec();

        res.status(200).json({
            success:true,
            message:" All Course fetched successfully",
            data:coursedata,
        })
        
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: "Failed to fetch all  a course ",
          });
        
        
    }

}


// get full course for with out logged user 
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReview")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

//get single course details for authenticate user 
exports.getFullCourseDetails = async (req, res) => {
/*    Required steps to get course 
   1. Fetch id from body 
   2. Validate id
   3. By using findByIde() function find course 
   4. Apply the populate function on all filds that are stored with Object id  
   5. validate the course details 
   6. return response 
*/
    try {
            //get id
            const {courseId} = req.body;
            const userId = req.user.id;
            //find course details
           
            const courseDetails = await Course.findOne(
                                        {_id:courseId}).populate(
                                            {
                                                path:"instructor",
                                                populate:{
                                                    path:"additionalDetails",
                                                },
                                            }
                                        )
                                        .populate("category")
                                        .populate("ratingAndReview")
                                        .populate({
                                            path:"courseContent",
                                            model:Section,
                                            populate:{
                                                path:"subSection",
                                                model:SubSection
                                            },
                                        })
                                        .exec();

                //validation
                if(!courseDetails) {
                    return res.status(400).json({
                        success:false,
                        message:`Could not find the course with ${courseId}`,
                    });
                }


                // calculating course progress count 
                let courseProgressCount = await CourseProgress.findOne({
                  courseId:courseId,
                  userId:userId,
                })

                // calculate the duration of course 
                let totlalDurationInSeconds=0
                courseDetails.courseContent.forEach((content)=>{
                  content.subSection.forEach((subSection)=>{
                    const timeDurationInSeconds= parseInt(subSection.duration)
                    totlalDurationInSeconds += timeDurationInSeconds;
                  })
                })
                 console.log(courseDetails.courseContent[0])
                const d1 =  await Section.findById(courseDetails.courseContent[0]);
                //return response
                return res.status(200).json({
                    success:true,
                    message:"Course Details fetched successfully",
                    data:{courseDetails,
                    // totalDuration,
                    completedVideos:courseProgressCount?.completedVideos
                    ?courseProgressCount?.completedVideos
                    :[]}
                   
                })

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}



// only instructor courses
exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 })
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }

//delete course 

  exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
  
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentEnrolled
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        if (section) {
          const subSections = section.subSection
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId)
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
  

      // delete this Course from the catecory Schema 
      await Catagory.findByIdAndUpdate({_id:course.category},{$pull: { course:course._id }})



      // Delete the course
      await Course.findByIdAndDelete(courseId)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }
  

  
  
