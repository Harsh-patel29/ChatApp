import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const SendEmail = async ({ to, text, url, subject, mailgenContent }) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "ChatApp",
      link: "http://localhost:3000/",
    },
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.APP_PASSWORD,
    },
  });
  const emailTextual = mailGenerator.generatePlaintext(mailgenContent);
  const emailHTML = mailGenerator.generate(mailgenContent);

  const mail = {
    to: to,
    subject: subject,
    url: url,
    text: emailTextual,
    html: emailHTML,
  };
  try {
    const info = await transporter.sendMail(mail);
    console.log("Mail sent successfully");
    console.log("To:", to);
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.log("Email Service failed Silently", error);
  }
};
const emailVerificationContent = (username, url) => {
  return {
    body: {
      name: username,
      intro: "Welcome to ChatApp! We're very excited to have you on board.",
      action: {
        instructions: "To get started with ChatApp, please click here:",
        button: {
          color: "#181818",
          text: "Confirm your account",
          link: url,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export { SendEmail, emailVerificationContent };
