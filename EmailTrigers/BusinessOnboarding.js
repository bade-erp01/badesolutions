import nodemailer from 'nodemailer'
import OnboardingTemplate from '../EmailTrigers/EmailTemplates/OnboardingTemplate'
import jwt from 'jsonwebtoken'
import Business from '../models/Business';
import dbConnect from '../lib/Mongodb';
import EMPLOYEES from '../models/Users';
const bcrypt = require('bcrypt');



const createResetTokenLink = (userId) => {
    const token = jwt.sign(
        { id: userId },
        process.env.EMAILTOKEN, // ✅ Use a secure secret key
        { expiresIn: "3d" } // ✅ Token expires in 3 days
    );
    
    const resetLink = `badesolutions.com.ng/auth/Account_Activation?query=${token}`;//for testing
    // const resetLink = `${DotEnv.url}api/auth/Account_Activation?query=${token}`; // for production
    return resetLink;
};


async function BusinessOnboardingMail(doc) {
   try {
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

    await transporter.verify()

    // Generate a random password for the user
    const plainPassword = Math.random().toString(36).slice(-8); // Generate an 8-character password
     const plainOps = Math.random().toString(36).slice(-4); // Generate an 4-character password

    
    let message = {
        from: `"BUSINESS AUTOMATED DYNAMIC ENTERPRISE" <${process.env.EMAIL}>`,
        to: doc.email,
        subject: "Welcome Message From the CEO.",
        html: OnboardingTemplate(doc,createResetTokenLink(doc._id)),//html template
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
    

    transporter.sendMail(message).then(async (msg) => {

        // Hash the password before saving to the database
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const hashedopsCode = await bcrypt.hash(plainOps, 10);

       //if the mail status is successful, we created the admin user 
       await EMPLOYEES.create({
        firstName:'Admin',
        lastName:doc.companyName,
        tenantId:doc.tenantId,
        Email:doc.email,
        password: hashedPassword,
        isAdmin:true,
        status:"active",
        opsCode:hashedopsCode,
        firstTimeOnboard:true,
        Apps:[
           {
            id: 1,
            Name: "Employee Management",
            url: "employee",
            icon: "https://img.icons8.com/?size=80&id=SiarGqFdE5SR&format=png",
            installed: true,
            Description: "Our robust access control features, including multi-factor authentication and granular permission settings, protect sensitive data and prevent unauthorized access.",
            Amount: 0.0
          },
        ]
       })

        // Send the plain password to the user in a separate email
      const passwordMessage = {
        from: `"${doc.companyName || process.env.EMAIL}" <${process.env.EMAIL}>`,
        to: doc.email,
        subject: "Admin Login Credentials 🔐",
        html: `<p>Your Admin account has been created successfully. Here are your login credentials.<br/> Email:${doc.email},<br/> password: <strong>${plainPassword}</strong> <br/>
         Ops-Code: <stron>${plainOps}</strong></p><br/> Ensure to Keep them Private or <a href='http://badesolutions.com.ng/auth/Forgot_password'>Reset Your Password Here</a>. <br/> Team B.A.D.E!!!🥳🥳💪 🎉`,
      };

      await transporter.sendMail(passwordMessage);
       

    }).catch(error => {
        throw new Error(error.message)
    })

  } catch (error) {
    console.error("❌ Error sending reset email:", error.message);
    //if error, delete te business account from database
    dbConnect()
    await Business.findByIdAndDelete(doc._id);
  }

}


module.exports = {
    BusinessOnboardingMail
}