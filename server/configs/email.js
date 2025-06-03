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

const sendBoardInvitationEmail = async (
  email,
  boardId,
  boardName,
  inviterName
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Lời mời tham gia bảng",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Lời mời tham gia bảng</h2>
        <p>Xin chào,</p>
        <p>${inviterName} đã mời bạn tham gia vào bảng "${boardName}".</p>
        <p>Để tham gia bảng này, vui lòng click vào link bên dưới:</p>
        <p>
          <a href="${process.env.FRONTEND_URL}/invite?boardId=${boardId}" 
             style="display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">
            Tham gia bảng
          </a>
        </p>
        <p>Nếu bạn chưa có tài khoản, bạn sẽ được chuyển hướng đến trang đăng nhập trước.</p>
        <p>Trân trọng,<br>Mini Trello Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  transporter,
  generateVerificationCode,
  sendVerificationEmail,
  sendBoardInvitationEmail,
};
