// import
const mongoose = require("mongoose");

const reatingSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
   
  },
  review: {
    type: String,
    required: true,

  },

  user: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Course",
      required:true,
    }
  
});


module.exports = mongoose.model("Reating",reatingSchema);