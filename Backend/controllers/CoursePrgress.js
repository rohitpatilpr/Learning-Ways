
const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");

exports.updataeCourseProgress = async (req ,res)=>{
    const {courseId, subSectionId } = req.body;
    const userId = req.user.id;
    try {


        console.log(" course ", courseId)
        console.log(" user  ", userId)
        // find subsection 
        const subsection = await SubSection.findById(subSectionId)

        if(!subsection)
        {
            return res.status(404).json({
                success:false,
                message:"Invalid Subsection"
            })
        }
        // find thr course progress document bases of coursse and user 

        const courseProgress = await  CourseProgress.findOne({
            courseId:courseId,
            userId:userId,
        })
        if(!courseProgress)
        {
            return res.status(404).json({
                success:false,
                message:"course Progress not Exist "
            })

        }
        else{
            // courseProgres exist but subsection already exist in couurse progress
            if(courseProgress.completedVideos.includes(subSectionId))
            {
                return res.status(401).json({
                    success:false,
                    message:"Video already completed"
                })
            }
        }

        // if not completed then push it in courseprogress 
        // push 
        courseProgress.completedVideos.push(subSectionId)

        // save all changes 
       await courseProgress.save()

       //return response 

       return res.status(200).json({
        success:true,
        message:"Course Progress Updated"
       })
        
    } catch (error) {
        console.error(error)
    return res.status(500).json({ error: "Internal server error" })
        
    }

}
