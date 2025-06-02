const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Mã xác thực đăng nhập",
    text: `Mã xác thực của bạn là: ${code}`,
  };

  await transporter.sendMail(mailOptions);
};

const sendBoardInvitationEmail = async (email, boardName, inviterName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Lời mời tham gia bảng",
    text: `${inviterName} đã mời bạn tham gia vào bảng "${boardName}". Vui lòng đăng nhập vào hệ thống ${process.env.FRONTEND_URL} để xem chi tiết.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  transporter,
  generateVerificationCode,
  sendVerificationEmail,
  sendBoardInvitationEmail,
};
