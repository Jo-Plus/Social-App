const confirmEmailTemplate = ({ username, link }) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Confirm Your Email</title>
    <style>
      body {
        background-color: #f6f7fb;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      }
      .header {
        background-color: #630E2B;
        text-align: center;
        padding: 30px 20px;
      }
      .header img { width: 80px; }
      .body { padding: 30px 40px; text-align: center; }
      .body h1 { color: #630E2B; margin-bottom: 10px; }
      .body p { color: #555; font-size: 15px; line-height: 1.6; }
      .verify-btn {
        display: inline-block;
        background-color: #630E2B;
        color: #fff !important;
        font-size: 16px;
        border-radius: 6px;
        padding: 12px 25px;
        margin: 25px 0;
        text-decoration: none;
        font-weight: bold;
      }
      .verify-btn:hover { background-color: #8b123a; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png" alt="App Logo" />
      </div>
      <div class="body">
        <h1>Confirm Your Email</h1>
        <p>Hello ${username || "User"},</p>
        <p>Thank you for signing up! Please confirm your email by clicking the button below:</p>
        <a href="${link}" class="verify-btn" target="_blank">Verify Email</a>
        <p>If the button doesn’t work, copy this link into your browser:</p>
        <p><a href="${link}" target="_blank">${link}</a></p>
      </div>
    </div>
  </body>
  </html>
  `;
};
module.exports = confirmEmailTemplate;