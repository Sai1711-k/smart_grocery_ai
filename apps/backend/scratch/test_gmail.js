const nodemailer = require('nodemailer');

async function testGmail() {
  console.log('Testing Gmail SMTP with credentials from backend/.env...');
  const user = 'sai17042004@gmail.com';
  const pass = 'tuqbzvfrfzevtezm';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('Transporter verified successfully!');
    
    console.log('Sending test email to', user, '...');
    const info = await transporter.sendMail({
      from: `"FreshCart Test" <${user}>`,
      to: user,
      subject: 'FreshCart OTP Test',
      text: 'Your test OTP is 123456'
    });
    console.log('Email sent successfully!', info.messageId);
  } catch (err) {
    console.error('SMTP Error:', err);
  }
}

testGmail();
