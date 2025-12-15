import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import Business from "../models/Business";

async function UserActivationMail(doc) {
  try {
    const Biz = await Business.findOne({ tenantId: doc.tenantId });

    // Generate activation token
    const token = jwt.sign(
      { id: doc._id, email: doc.Email },
      process.env.EMAILTOKEN,
      { expiresIn: "2h" }
    );

    const activationLink = `https://badesolutions.com.ng/auth/Account_Activation/${token}`;

    const config = {
      host: "smtp.zoho.com",
      service: "zoho",
      secure: true,
      port: 465,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    };

    let transporter = nodemailer.createTransport(config);
    await transporter.verify();

    let message = {
      from: `"Businesss Automated Dynamic Enterprise" <${
        process.env.EMAIL || process.env.EMAIL2
      }>`,
      to: doc.Email,
      subject: `Account Activation Required 🔐`,
      html: `<p>Hello ${doc.firstName},</p>
          <p>${Biz.companyName} has invited you to join Businesss Automated Dynamic Enterprise.</p>
          <p><strong>Please activate your account by clicking the link below:</strong></p>
          <br/> <a href="${activationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">ACTIVATE ACCOUNT</a>
          <br/><br/><p>This link expires in 2 hours.</p>
          <p><strong>Do not reply to this email</strong></p>`,
      headers: {
        "X-Priority": "2", // medium priority
        "X-MSMail-Priority": "High", // Microsoft email priority
        constance: "High", // Marks email as constant
        "List-Unsubscribe":
          "<mailto:unsubscribe@badesolutions.com.ng>, <https://badesolutions.com.ng/unsubscribe>", // Unsubscribe options
        Precedence: "bulk", // Helps prevent spam filtering for bulk emails
        "Auto-Submitted": "auto-generated", // Indicates automated email to avoid reply loops
        "X-Feedback-ID": "12345:abcdef:xyz", // Helps track feedback loops (use provider-specific ID)
        "X-SES-MESSAGE-TAGS": "campaign=account_verification", // AWS SES campaign tracking
        "X-Mailer": "Nodemailer/6.9.0", // Identifies the email sending library
        "X-Originating-IP": "192.168.1.1", // Shows sender's IP (useful for tracking)
      },
    };

    transporter
      .sendMail(message)
      .then((msg) => {
        console.log("Activation mail sent successfully", msg);
      })
      .catch((error) => {
        throw new Error(error.message);
      });
  } catch (error) {
    console.error("❌ Error sending activation email:", error.message);
  }
}

module.exports = {
  UserActivationMail,
};
