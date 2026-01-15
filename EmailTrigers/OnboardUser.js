import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import Business from '../models/Business';
import dbConnect from '../lib/Mongodb';



// const createResetTokenLink = (userId) => {
//     const token = jwt.sign(
//         { id: userId },
//         process.env.EMAILTOKEN, // ✅ Use a secure secret key
//         { expiresIn: "3d" } // ✅ Token expires in 3 days
//     );
    
//     const resetPasswordLink = `http://localhost:3001/auth/Account_Activation?query=${token}`;//for testing
//     // const resetLink = `${DotEnv.url}api/auth/Account_Activation?query=${token}`; // for production
//     return resetPasswordLink;
// };


async function userOnboardingMail(doc) {
   try {
    // find the business that registered the user
    dbConnect("BadeAdmin")

    const Biz = await Business.findOne({tenantId:doc.tenantId}) 

    const config = {
        host: "smtp.gmail.com",
        service: "gmail",
        port : 465,
        secure: true,
        auth: {
            user: "operations.bade@gmail.com",
            pass: process.env.EMAIL2PASS
        },
        tls: { rejectUnauthorized: false }
    };

    let transporter = nodemailer.createTransport(config);

    await transporter.verify();
    
    let message = {
        from: `"Businesss Automated Dynamic Enterprise" <${process.env.EMAIL || process.env.EMAIL2}>`,
        to: doc.Email,
        subject: `${Biz.companyName} User Invitation 📧`,
        html: `<p>Hello ${doc.firstName}, ${Biz.companyName} invites you to onboard on Businesss Automated Dynamic Enterprise . Here is your login credential.<br/> Email: ${doc.Email}</p><br/>
        <p> Ensure to reset your Password then contact your Administrator to grant you access to Enviroment.</p>
        <br/> <a href="https://badesolutions.com.ng/auth/Forgot_password">RESET PASSWORD HERE</a>

        <br/> <a>** Do not reply to this email **</a>`,//html template
        headers: {
            'X-Priority': '1', // High priority 
            'X-MSMail-Priority': 'High', // Microsoft email priority
            'Importance': 'High', // Marks email as important
            'List-Unsubscribe': '<mailto:unsubscribe@badesolutions.com.ng>, <https://badesolutions.com.ng/unsubscribe>', // Unsubscribe options
            'Precedence': 'bulk', // Helps prevent spam filtering for bulk emails
            'Auto-Submitted': 'auto-generated', // Indicates automated email to avoid reply loops
            'X-Feedback-ID': '12345:abcdef:xyz', // Helps track feedback loops (use provider-specific ID)
            'X-SES-MESSAGE-TAGS': 'campaign=account_verification', // AWS SES campaign tracking
            'X-Mailer': 'Nodemailer/6.9.0', // Identifies the email sending library
            'X-Originating-IP': '192.168.1.1', // Shows sender's IP (useful for tracking)
        }

    }
    

    transporter.sendMail(message).then((msg) => {
       console.log('Invitation mail sent successfully',msg)
    }).catch(error => {
        throw new Error(error.message)
    })

  } catch (error) {
    console.error("❌ Error sending reset email:", error.message);
  }

}


module.exports = {
    userOnboardingMail
}