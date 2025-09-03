
// import all Required components 

const express = require("express");
const app = express();

const router= require("./routes/Route")

require("dotenv").config;

const database = require("./config/database");
const cookieParser= require("cookie-parser");

// It use for intraction or intertenment between frontend and backend apis
const cors = require("cors");

const {cloudinaryConnection} =require("./config/cloudinary");
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 4000;

//database connection
database.connection();
//middleware 
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({ 
        origin:"*",
        credentials:true
    })
)
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/temp"
    })
);

//cloudinary connect 
cloudinaryConnection();

// routs 
app.use("/api/v1", router);

//default route 
app.get("/",(req,res)=>{
    console.log("Your server is up and running.....");
    return res.status(200).json({
        success:true,
        message:"Your server is up and running.....",
    })
})

//start server 

app.listen(PORT,()=>{
    console.log(`App is running at port ${PORT}`);
})
