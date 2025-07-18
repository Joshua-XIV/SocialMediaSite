import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendVerificationEmail = async (email, code, context = 'signup') => {
  const isLogin = context === 'login';
  const subject = isLogin ? 'Login verification code' : 'Verify your email address';
  const title = isLogin ? 'Login to Social Connecting' : 'Welcome to Social Connecting!';
  const message = isLogin 
    ? 'Please enter this verification code to complete your login:'
    : 'Your verification code is:';
  const warning = isLogin
    ? 'If you did not request this code, someone may be trying to access your account. Please change your password immediately and consider enabling additional security measures.'
    : "If you didn't request this code, you can safely ignore this email.";
  
  const mailOptions = {
    from: '"Social Connecting" <' + process.env.EMAIL_USER + '>',
    to: email,
    subject: subject,
    html: `
      <h1>${title}</h1>
      <p>${message} <strong>${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>${warning}</p>
    `
  };
  await transporter.sendMail(mailOptions);
}; 