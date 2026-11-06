const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    await transporter.sendMail({
      from: `"Website Contact Form" <${process.env.EMAIL_USER}>`,
      to: "bgmindwhcload@gmail.com",
      replyTo: email,
      subject: `Contact Form: ${subject}`,

      text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,

      html: `
        <h2>New Contact Form Message</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>

        <h3>Message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    res.status(200).json({
      message: "Message sent successfully!",
    });
  } catch (error) {
  console.error("Contact email error:", {
    message: error.message,
    code: error.code,
    response: error.response,
    command: error.command,
  });

  return res.status(500).json({
    message: "Unable to send email",
    error: error.message,
  });
}
});

module.exports = router
