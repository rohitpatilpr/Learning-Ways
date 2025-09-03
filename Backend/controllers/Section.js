const Section = require("../models/Section");
const Course = require("../models/Course");
const mongoose = require("mongoose");
const SubSection =require("../models/SubSection")

//create Section
exports.createSection = async (req, res) => {
  try {
    /*  Rquired steps to create section

          1. Fetch data from body. 
          2. Validate the fetched data.
          3. Create new section.
          4. Add this sectoin id in Course sehema. 
          5. Send positive response.
          6. Otherwise send negative response.
    */

    //Fetch data from body.
    const { sectionName, courseId } = req.body;

    //Validate the fetched data.
    if (!sectionName || !courseId) {
      return res.status(401).json({
        success: false,
        message: "Please Fill all Fields",
      });
    }

    //Create new section.
    const sectionData = await Section.create({sectionName});

    // Add this sectoin id in Course sehema.

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent:sectionData._id,
        },
      },{new:true}
    ).populate({
      path:"courseContent",
      populate:{
        path:"subSection",
      },

    }).exec();



    /////TODO  how yo get secction as well as subsection data when print updatedcourse
    ///// use populate


    // Send Positive response
    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse:updatedCourse
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Failed to create a section ",
    });
  }
};




// update the section 
exports.UpdateSection = async (req, res) => {
  try {
    /*  Rquired steps to update section

          1. Fetch data from body. 
          2. Validate the fetched data.
          3. Update the Section
          4. Send positive response.
          5. Otherwise send negative response.
    */

    //Fetch data from body.

        
    const {sectionName,sectionId,courseId} = req.body;

    //Validate the fetched data.
    if (!sectionName || !sectionId) {
     return res.status(401).json({
        success: false,
        message: "Invalid section, Please try again",
      });
    }

    //Update section.
    const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},{
        sectionName:sectionName,
    },{new:true})

    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })

    // Send Positive response
    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      updatedSection,
      data:course,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Failed to update section ",
    });
  }
};


// Delete the section 
exports.deleteSection = async (req, res) => {
  try {
   /*  Rquired steps to delete section

          1. Fetch data from req.params. 
          2. Validate the fetched data.
          3. Delete section. 
          4. Send positive response.
          5. Otherwise send negative response.
    */

    //Fetch data from req.params.
       // here we consider the sectionId get by the request parameter 
    const { sectionId ,courseId } = req.body;

    //Validate the fetched data.
    if (!sectionId) {
      return res.status(401).json({
        success: false,
        message: " Please fill all fields",
      });
    }

    
    const section = await Section.findById(sectionId);
    if(!section)
    {
      return res.status(401).json({
        success: false,
        message: "Section not found ",
      });
    }
    
    
    //Delete section.
    ///// TODO: do you need to delete this section id from course schema
    /// answer is yes 
    // virtualy it show as deleted but in data base entry is not deleted from ciurse data 
    
    const deletedSection = await Section.findByIdAndDelete(sectionId)


    // update course
    const updatedCourse = await Course.findByIdAndUpdate(courseId,{
      $pull: { courseContent: sectionId} },
      { new: true } ) .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      }).exec();


      //deleted all section under this section
      if(section.subSection)
      {

        await SubSection.deleteMany({ _id: { $in: section.subSection} });
      }

    // Send Positive response
    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data:updatedCourse
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Failed to delete section",
      // updatedCourse:updatedCourse,
    });
  }
};
