import nodemailer from "nodemailer";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// Nodemailer config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Twilio config
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const notificationService = {
  sendEmail: async ({ to, subject, text }) => {
    try {
      console.log(`[NotificationService] Sending Email to ${to}`);
      
      if (!process.env.SMTP_HOST) {
        console.warn("[NotificationService] SMTP config missing. Email not sent.");
        return { status: "FAILED", error: "Missing SMTP configuration" };
      }

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"ODMM" <no-reply@odmm.in>',
        to,
        subject,
        text,
      });

      console.log(`[NotificationService] Email sent to ${to} successfully.`);
      return { status: "SENT", error: null };
    } catch (error) {
      console.error(`[NotificationService] Email failed to ${to}:`, error);
      return { status: "FAILED", error: error.message || "Unknown error" };
    }
  },

  sendSMS: async ({ to, text }) => {
    try {
      console.log(`[NotificationService] Sending SMS to ${to}`);
      
      if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
        console.warn("[NotificationService] Twilio config missing. SMS not sent.");
        return { status: "FAILED", error: "Missing Twilio configuration" };
      }

      await twilioClient.messages.create({
        body: text,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to.startsWith("+") ? to : `+91${to}`, // Assuming India default (+91)
      });

      console.log(`[NotificationService] SMS sent to ${to} successfully.`);
      return { status: "SENT", error: null };
    } catch (error) {
      console.error(`[NotificationService] SMS failed to ${to}:`, error);
      return { status: "FAILED", error: error.message || "Unknown error" };
    }
  },

  sendWhatsApp: async ({ to, text }) => {
    try {
      console.log(`[NotificationService] Sending WhatsApp to ${to}`);
      
      if (!twilioClient || !process.env.TWILIO_WHATSAPP_NUMBER) {
        console.warn("[NotificationService] Twilio WhatsApp config missing. WhatsApp not sent.");
        return { status: "FAILED", error: "Missing Twilio WhatsApp configuration" };
      }

      await twilioClient.messages.create({
        body: text,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${to.startsWith("+") ? to : `+91${to}`}`,
      });

      console.log(`[NotificationService] WhatsApp sent to ${to} successfully.`);
      return { status: "SENT", error: null };
    } catch (error) {
      console.error(`[NotificationService] WhatsApp failed to ${to}:`, error);
      return { status: "FAILED", error: error.message || "Unknown error" };
    }
  },
};
