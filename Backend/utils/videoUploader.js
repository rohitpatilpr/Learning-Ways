const cloudinary = require("cloudinary").v2

function isSupported(supported, extention) {
    return supported.includes(extention);
  }
  async function uploadOnCloudinary(file, folder,quality,width) {
    const options = { folder:folder, use_filename:true, unique_filename:false,public_id:file.name};
    options.resource_type="auto";
    if(quality && !width)
    {
      options.quality=quality;
    }
    if(quality && width)
    {
      options.height=quality
      options.width=width
    }
  
    return await cloudinary.uploader.upload(file.tempFilePath, options);
    // cloudinary.uploader.upload("my_image.jpg", use_filename => true, unique_filename => false)
  }

exports.videoUpload = async (file, folder ) => {
    try {
    //   // fetch data from body
    //   const { name, email, tags } = req.body;
    //   console.log();
  
      // fetch file form body files
     // const file = req.files.videoFile;
      // console.log(file);
      // validate the file
      const supported = ["mkv", "mp4"];
      const extention = file.name.split(".")[1].toLowerCase();
      console.log(extention);
  
      // if the extention is not supported  reeturn error
      if (!isSupported(supported, extention)) {
        return res.json({
          success: false,
          message: "File is not supported",
        });
      }
  
     // size cheaking 
      console.log("image size in mb :",(file.size/(1024*1024)));
      const sizeInMb = file.size/(1024*1024);
      if(sizeInMb>=20)
      {
        console.log("Size greater than 20 mb")
        return res.json({
          success: false,
          message: "File size grater than 20 mb",
        });
  
      }
  
      // upload file to cloudinary
   return  await uploadOnCloudinary(file, folder);
  
      // save the data in db
    //   const fileData = await File.create({
    //      name,
    //      tags,
    //      email,
    //      imageUrl:response.secure_url
    //   })
    //   res.json({
    //       success: true,
    //       message: "Video Uploaded on Cloudinarey Successfully",
    //       imageUrl:response.secure_url
    //     });
    } catch(err) {
    //   res.json({
    //       success: false,
    //       message: "video not Uploaded on Cloudinarey",
    //     });
        console.log(err.message);
  
    }
  };
  