const nodemailer = require('nodemailer');
const dns = require('dns');

async function test() {
  console.log("Testing SMTP connection...");
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'sai17042004@gmail.com',
      pass: 'tuqbzvfrfzevtezm'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Hacky but reliable way to force ipv4 if custom lookup doesn't work:
  // but let's see if dns.setDefaultResultOrder works here:
  dns.setDefaultResultOrder('ipv4first');

  try {
    await transporter.verify();
    console.log("Verified successfully!");
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
