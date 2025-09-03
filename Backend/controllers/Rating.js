const Rating = require("../models/Reating");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");
const Reating = require("../models/Reating");

exports.createRating =async (req,res)=>{
    try {

        /* 
          Required steps to created the rating 
          1. Get data from body
          2. Get user from req.user 
          3. Validate the data 
          4. Check user is enrolled for this course 
          4. Check for user already reate for this course 
          5. Create the entry in Data base 
          6. Update the Course schema with ratinh and review section 
          7. Send response 
        
        */


    
        //   1. Get data from body
        const {rating, review, courseId}= req.body;
       
        //   2. Get user from req.user 
        const userId = req.user.id;

        //   3. Validate the data 
        if(!rating || !userId, !courseId)
        {
            return res.status(401).json({
                success:false,
                message:"Please fill all field required!!"
            });
        }

        // 4.check user is enrolled for thiss course or not 
        // this is new way to match the element 
       const  courseDetails = await Course.findOne({_id:courseId, 
                                                    studentEnrolled:{$elemMatch:{$eq:userId}}});
        if(!courseDetails)
        {
            return res.status(404).json({
                success:false,
                message:"Studend Not enrolled in course"

            })
        }

        // 4.  Check for user already reate for this course 
        const alreadyReviewed = await Rating.findOne({user:userId, course:courseId});

         if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course already reviewed by user",
      })
    }
        // 5. Create the entry in Data base 
        const ratingData = await Rating.create({
            rating,
            review,
            user:userId,
            course:courseId});

        //6. Update the Course schema with ratinh and review section 
         await Course.findByIdAndUpdate(courseId,{
            $push:{ratingAndReview:ratingData._id},
        },{new:true});

        await courseDetails.save()

        //7. Send response 
        res.status(200).json({
            success:true,
            message:"Reating and Review Created successfully",
            ratingData
        })
        
    } catch (error) {
        console.log(error);
        return  res.status(500).json({
            success:false,
            message:"Failed to craete Reating and Review",
        })
        
    }
}


// get average rating  for perticular course 

exports.averageRating = async (req,res)=>{
    try {
        /* 
        Required steps to caculate the average of rating 
        1. Get course id from body
        2. Validate data.
        3. Calcute average by using the aggregate function
        4. Return average in responce
        */


        // 1. Get course id from body
        const courseId = req.body.courseId;
        // 2. Validate data.
        if(!courseId){
            return res.status(404).json({
                success:false,
                message:"Invalid course id "

            })

        }
        // 3. Calcute average by using the aggregate function
        // by using aggregate function we calculate the average reating for perticular course 
        // aggregate function return output in the form of array 
        const result = await Reating.aggregate([
          {  
            //this match the all course in reatinh and review schema 
            $match:{
                course:new mongoose.Types.ObjectId(courseId),
            }
        },
        {
            // this group statement group the all ratings with same course id and calculate the average of it 
            $group:{
                _id:null,
                averageRating:{$avg:"$reating"},

            }
        }
        ])

        // if reating is present for this course the send it in response 
        if(result.length>0)
        {
            return res.status(200).json({
                success:true,
                message:"Avrage rating calculated successfuly ",
                averageRating:result[0].averageRating,
            })
        }

        // 4. Return average in responce
        return res.status(200).json({
            success:true,
            message:"No reating yet for this course",
            averageRating:0// no reating present 
        })
        
    } catch (error) {
        
        return res.status(500).json({
            success:false,
            message:"Failed to calculate the average raeating",
            
        })
        
    }
}


// get all reating Of perticular course 
exports.courseRating = async (req,res)=>{
    try {
        /* 
        Required steps to caculate the average of rating 
        1. Get course id from body
        2. Validate data.
        3. Find the all reating of given course 
        4. Sort this with Decresing order and popolate user wiih perticular fields 
        5. If reating is present then return reatings 
        6. Return response.
        */


        // 1. Get course id from body
        const courseId = req.body.courseId;
        // 2. Validate data.
        if(!courseId){
            return res.status(404).json({
                success:false,
                message:"Invalid course id "

            })

        }

        const result = await Reating.find({course:new mongoose.Types.ObjectId(courseId)})
                                                                                .sort({reating:"desc"})
                                                                                .populate({
                                                                                    path:"user",
                                                                                    select:"firstName, lastName, email, image",})

        // if reating is present for this course the send it in response 
        if(result.length>0)
        {
            return res.status(200).json({
                success:true,
                message:" all reating for course fetched successfuly ",
                rating:result,
            })
        }

        return res.status(200).json({
            success:true,
            message:"No reating yet for this course",
            rating:0// only one element present in result array.
        })
        
    } catch (error) {
        
        return res.status(500).json({
            success:false,
            message:"Failed to fetched reating for this course ",
            
        })
        
    }
}



// get all reating of all course 
exports.getAllReating = async (req,res)=>{
    try {

        /* 
        Required steps to get all rating 
        1. Get all reating by using find method 
        3. Return responce
        */
        

        // 1. Get all reating by using find method 

        const allReating = await Reating.find({})
                                        .sort({reating:"desc"})
                                        .populate({
                                            path:"user",
                                            select:"firstName lastName email image",
                                        })
                                        .populate({
                                            path:"course",
                                            select:"courseName",
                                        }).exec()
                
  
            return res.status(200).json({
                success:true,
                message:"Fetched all reatings ",
                data:allReating

            })
        

        // 3. Return responce
        
    } catch (error) {
        console.log("")
        return res.status(404).json({
            success:false,
            message:"Failed to fetched all reatings"

        })
         
    }

}









