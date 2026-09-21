import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // Change this based on your email provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email app password
  },
});

export async function POST(req: Request) {
  try {
    const { phone, message, carrierDomain } = await req.json();

    if (!phone || !message || !carrierDomain) {
      return NextResponse.json({ error: "Missing phone, message, or carrier domain" }, { status: 400 });
    }

    // Convert Phone Number to Email Format
    const smsEmail = `${phone}@${carrierDomain}`;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: smsEmail,
      subject: "SMS Message",
      text: message,
    });

    return NextResponse.json({ success: true, info });
  } catch (error) {
    console.error("Email-to-SMS Error:", error);
    return NextResponse.json({ error: "Failed to send SMS via Email", details: error }, { status: 500 });
  }
}
