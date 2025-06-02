const { admin, db } = require("../configs/firebase");
const jwt = require("jsonwebtoken");
const {
  generateVerificationCode,
  sendVerificationEmail,
} = require("../configs/email");
const {
  getGithubAuthUrl,
  getGithubAccessToken,
  getGithubUserData,
  getGithubUserEmails,
} = require("../configs/github");

exports.signup = async (req, res) => {
  try {
    const { email } = req.body;

    const userRef = db.collection("users");
    const snapshot = await userRef.where("email", "==", email).get();

    if (!snapshot.empty) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }

    const verificationCode = generateVerificationCode();
    await sendVerificationEmail(email, verificationCode);

    const newUser = {
      email,
      verificationCode,
      createdAt: new Date(),
    };

    const docRef = await userRef.add(newUser);

    res.status(201).json({
      id: docRef.id,
      email,
      message: "Mã xác thực đã được gửi đến email của bạn",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyCode = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    const userRef = db.collection("users");
    const snapshot = await userRef
      .where("email", "==", email)
      .where("verificationCode", "==", verificationCode)
      .get();

    if (snapshot.empty) {
      return res
        .status(401)
        .json({ error: "Email hoặc mã xác thực không hợp lệ" });
    }

    const userDoc = snapshot.docs[0];
    const token = jwt.sign({ id: userDoc.id, email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      accessToken: token,
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const userRef = db.collection("users");
    const snapshot = await userRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Email không tồn tại" });
    }

    const newVerificationCode = generateVerificationCode();
    await sendVerificationEmail(email, newVerificationCode);

    await userRef.doc(snapshot.docs[0].id).update({
      verificationCode: newVerificationCode,
    });

    res.json({
      message: "Mã xác thực mới đã được gửi đến email của bạn",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.githubAuth = (req, res) => {
  const githubAuthUrl = getGithubAuthUrl();
  res.redirect(githubAuthUrl);
};

exports.githubCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const accessToken = await getGithubAccessToken(code);
    const userData = await getGithubUserData(accessToken);
    const emails = await getGithubUserEmails(accessToken);

    const primaryEmail = emails.find((email) => email.primary)?.email;

    if (!primaryEmail) {
      return res.status(400).json({ error: "Không tìm thấy email từ GitHub" });
    }

    const userRef = db.collection("users");
    const snapshot = await userRef.where("email", "==", primaryEmail).get();

    let userId;

    if (snapshot.empty) {
      const newUser = {
        email: primaryEmail,
        githubId: userData.id,
        githubUsername: userData.login,
        createdAt: new Date(),
      };

      const docRef = await userRef.add(newUser);
      userId = docRef.id;
    } else {
      userId = snapshot.docs[0].id;
    }

    const token = jwt.sign(
      { id: userId, email: primaryEmail },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/github/callback?token=${token}`
    );
  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
};
