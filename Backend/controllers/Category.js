const Category = require("../models/Category");
const Course =require("../models/Course");
const mongoose = require("mongoose")

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }



exports.createCategory = async (req, res) =>{
    try {
        /*
        To create the category required steps 

        1. Fetch Data 
        2. validate 
        3. Create Entry in Database
        4. Return positive response.
        5. Otherwise return negative response
        
         */

        //fetch Data 
        const {name ,description} = req.body;
        //validate 
        if(!name || !description){
            return res.status(401).json({
                success: false,
                message: "Please fill all fields",
              });
            

        }

        //Create Entry in DB
        const category = await Category.create({
            name:name,
            description:description,
        });
        console.log(category);

        res.status(200).json({
            success:true,
            message:"category Entry Created Successfully",
        })

        
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: "category entry not created , please try again",
          });
        
        
    }
}

exports.getAllCategory = async (req,res)=>{
    try {
        /*To get all Category, The required steps are below,

     1. By using find() method get all course Details with send all parameter true and populate instructor
     2. Return positive response.
     3. Otherwise return negative response
     
     */

        //get data from category module 

        const  cataegory= await Category.find() 
        // data must have this name and the description parameter 

        res.status(200).json({
            success:true,
            message:"Data Get successfully ",
            cataegory,
        })


        
    } catch (error) {

        console.log(error)
        return res.status(401).json({
            success: false,
            message: "Fail to fetch the data of cataegory",
          });
        
        
    }
}

//category Page details 



// exports.categoryPageDetails = async (req,res)=>{

//     try {
//         /*
//         Required steps to Get the category page details 

//         1. Get categoryId 
//         2. Get courses for perticular category 
//         3. validation
//         4. Get course for different category 
//         5. Get top selling courses 
//         6. return responce.

//          */

//         // 1. Get categoryId 
//         const {categoryId}= req.body;
//         console.log("category id", categoryId)

//         // 2. Get courses for perticular category 
//         // const objectId = new mongoose.Types.ObjectId(categoryId);

//         const selectedCategory = await Category.findById(categoryId)
//         .populate({
//             path: "course",
//             match: { status: "Published" },
//             populate: "ratingAndReview",
//           }).exec();
//         // 3. validation
//         if(!selectedCategory)
//         {
//             return res.status(404).json({
//                 success:false,
//                 message:"Category data not found "
//             })
//         }


//          // Handle the case when there are no courses
//     //     if (selectedCategory.course.length === 0) {
//     //         console.log("No courses found for the selected category.")
//     //         return res.status(404).json({
//     //             success: false,
//     //             message: "No courses found for the selected category.",
//     //         })
//     //         }
  
//     //     // 4. Get course for different category 
//     //      const categoriesExceptSelected = await Category.find({
//     //         _id: { $ne: categoryId },
//     //       })

//     //       let differentCategory = await Category.findOne(
//     //         categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
//     //           ._id
//     //       )
//     //         .populate({
//     //           path: "course",
//     //           match: { status: "Published" },
//     //         })
//     //         .exec()

        
        
//     //     // 5. Get top selling courses 
//     //     const allCategories = await Category.find()
//     //     .populate({
//     //       path: "course",
//     //       match: { status: "Published" },
//     //     })
//     //     .exec()
//     //   const allCourses = allCategories.flatMap((category) => category.courses)
//     //   const mostSellingCourses = allCourses
//     //     .sort((a, b) => b.sold - a.sold)
//     //     .slice(0, 10)
  
          

//         // 6. return responce.
        
//         res.status(200).json({
//             success: true,
//             data: {
//               selectedCategory,
//             //   differentCategory,
//             //   mostSellingCourses,
//             },
//           })
        

        
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message:"Failed to fetch category data."
//         })
        
//     }
// }

exports.categoryPageDetails = async (req, res) => {
    try {
      const { categoryId } = req.body
      console.log("cate",categoryId)
    //  const objectId = new mongoose.Types.ObjectId(categoryId);

  
      // Get courses for the specified category
      const selectedCategory = await Category.findById(categoryId)
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: "ratingAndReview",
        })
        .exec()
  
      // console.log("SELECTED COURSE", selectedCategory)
      // Handle the case when the category is not found
      if (!selectedCategory) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }


      // Handle the case when there are no courses
      if (selectedCategory.course.length === 0) {
        console.log("No courses found for the selected category.")
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }
  
      // Get courses for other categories
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      })
      let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "course",
          match: { status: "Published" },
        })
        .exec()
      console.log()
  
      
      // Get top-selling courses across all categories
      const allCategories = await Category.find()
        .populate({
          path: "course",
          match: { status: "Published" },
          populate :{
            path:"instructor"
          }
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.course)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)
  
      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      })
    } catch (error) {

        console.log(error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }