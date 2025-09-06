import nodemailer from "nodemailer";

async function sendEmailNotification(doc, { subject, html }) {
  try {
    const transporter = nodemailer.createTransport({
      host: "operations.bade@gmail.com",
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: "operations.bade@gmail.com",
        pass: "yweglfaoxuvqkqri",
      },
      tls: { rejectUnauthorized: false }, //always add this to stop error in console
    });

    await transporter.verify();

    // Main onboarding email
    await transporter.sendMail({
      from: `"Business Automated Dynamic Enterprise" <${process.env.EMAIL}>`,
      to: doc,
      subject: subject,
      html: html,
      headers: {
        "X-Priority": "1",
        Importance: "High",
        "List-Unsubscribe":
          "<mailto:unsubscribe@badesolutions.com.ng>, <https://badesolutions.com.ng/unsubscribe>",
        Precedence: "bulk",
        "Auto-Submitted": "auto-generated",
      },
    });
  } catch (error) {
    console.error("❌ Error occurred:", error.message);
  }
}

export default sendEmailNotification;
