 const { contactUsEmail } = require("../MailFormat/contactFormRes");
const {mailSender}  = require("../utils/mailSender");



exports.contactUs = async (req, res) =>
{
    try {

        /*
        Require steps to contact us 
        1. Fetch data from body
        2. validation 
        3. Send mail to LearningWays.com 
        4. Send mail to student as a receive your query 
        5. Send response
        */

        // 1. Fetch data from body
        const {firstName , lastName , email, contact, message}= req.body;
        // 2. validation 
        if(!firstName || !lastName  || !email || !contact || !message)
        {
            return res.status(401).json({
                success:false,
                message:"Fill all the Fields",
            })
        }
        // 3. Send mail to LearningWays.com 
       const  ourEmail ="amarjadhavchegg@gmail.com"
        await mailSender(ourEmail, 
                           `Mail received from student ${firstName} ${lastName}`,
                           `The query of student is : ${message}`);


        // 4. Send mail to student as a receive your query 
        await mailSender(email,"Your Data send successfully",
                         contactUsEmail(email,firstName,lastName,message,contact,"+91") )
        // 5. Send response 
        res.status(200).json(
            {
                success:true,
                message:"About Us done successfully"
            }
        )

        
    } catch (error) {
        console.log(error)
        res.status(500).json(
            {
                success:false,
                message:"About Us not done "
            }
        )
    }

}