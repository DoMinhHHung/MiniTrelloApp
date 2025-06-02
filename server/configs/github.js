const axios = require("axios");

const GITHUB_CONFIG = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  redirectUri: process.env.GITHUB_REDIRECT_URI,
};

const getGithubAuthUrl = () => {
  return `https://github.com/login/oauth/authorize?client_id=${GITHUB_CONFIG.clientId}&redirect_uri=${GITHUB_CONFIG.redirectUri}&scope=user:email`;
};

const getGithubAccessToken = async (code) => {
  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CONFIG.clientId,
        client_secret: GITHUB_CONFIG.clientSecret,
        code: code,
        redirect_uri: GITHUB_CONFIG.redirectUri,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    throw new Error("Không thể lấy access token từ GitHub");
  }
};

const getGithubUserData = async (accessToken) => {
  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Không thể lấy thông tin user từ GitHub");
  }
};

const getGithubUserEmails = async (accessToken) => {
  try {
    const response = await axios.get("https://api.github.com/user/emails", {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Không thể lấy email từ GitHub");
  }
};

module.exports = {
  getGithubAuthUrl,
  getGithubAccessToken,
  getGithubUserData,
  getGithubUserEmails,
};
