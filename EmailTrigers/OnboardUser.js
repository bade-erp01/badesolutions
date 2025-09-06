import nodemailer from 'nodemailer'
import UserOnboardingTemplate from '../EmailTrigers/EmailTemplates/UserOnboardingTemplate'
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
    dbConnect()

    const Biz = await Business.findOne({tenantId:doc.tenantId}) 

    const config = {
        host: 'smtp.zoho.com',
        port : 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        },
        tls: { rejectUnauthorized: false }
    };

    let transporter = nodemailer.createTransport(config);

    await transporter.verify();
    
    let message = {
        from: `"${Biz.companyName.toUpperCase() || process.env.EMAIL}" <${process.env.EMAIL}>`,
        to: doc.Email,
        subject: `User Invitation 📧`,
        html: `<p>Hello ${doc.firstName}, You have been invited to onboard on BADE with ${Biz.companyName}. Here is your login credential.<br/> Email: ${doc.email}</p><br/>
        <p> Ensure to reset your Password then contact your Administrator to grant you access to Enviroment.</p>
        <br/> <a href="https://badesolutions.com.ng/auth/Forgot_password">RESET PASSWORD HERE</a>`,//html template
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