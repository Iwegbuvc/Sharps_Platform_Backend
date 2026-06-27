const getDatTimeUTC = () => {
  const now = new Date();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = String(now.getUTCDate()).padStart(2, "0");
  const month = months[now.getUTCMonth()];
  const year = now.getUTCFullYear();
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");

  return `${day} ${month} ${year} ${hours}:${minutes}:${seconds} (UTC)`;
};

const forgotPasswordMail = (firstName, resetPasswordToken) => {
  const date = getDatTimeUTC();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:20px auto;background:#fff;border-radius:8px;overflow:hidden;">
    <tr>
      <td style="background:#0d4b8f;color:#fff;padding:20px;text-align:center;">
        <h1 style="margin:0;font-size:24px;">Sharps Collections</h1>
        <p style="margin:8px 0 0;font-size:14px;">Password reset request</p>
      </td>
    </tr>
    <tr>
      <td style="padding:30px;">
        <p style="font-size:16px;line-height:1.6;">Hello ${firstName},</p>
        <p style="font-size:16px;line-height:1.6;">We received a request to reset your password on <strong>${date}</strong>.</p>
        <p style="font-size:16px;line-height:1.6;">Click the button below to set a new password. This link expires in 1 hour.</p>
        <p style="text-align:center;margin:30px 0;">
          <a href="${resetUrl}" style="background:#0d4b8f;color:#fff;text-decoration:none;padding:14px 24px;border-radius:6px;display:inline-block;font-weight:bold;">Reset password</a>
        </p>
        <p style="font-size:14px;line-height:1.6;color:#555;">If the button does not work, copy and paste this URL into your browser:</p>
        <p style="font-size:14px;line-height:1.6;word-break:break-all;color:#0d4b8f;">${resetUrl}</p>
        <p style="font-size:14px;line-height:1.6;color:#666;">If you did not request a password reset, ignore this email or contact support.</p>
      </td>
    </tr>
    <tr>
      <td style="background:#f0f4f8;color:#666;padding:18px;font-size:12px;text-align:center;">
        Sharps Collections
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

const passwordResetConfirmationMail = (firstName) => {
  const date = getDatTimeUTC();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Changed</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:20px auto;background:#fff;border-radius:8px;overflow:hidden;">
    <tr>
      <td style="background:#0d4b8f;color:#fff;padding:20px;text-align:center;">
        <h1 style="margin:0;font-size:24px;">Sharps Collections</h1>
        <p style="margin:8px 0 0;font-size:14px;">Password changed successfully</p>
      </td>
    </tr>
    <tr>
      <td style="padding:30px;">
        <p style="font-size:16px;line-height:1.6;">Hello ${firstName},</p>
        <p style="font-size:16px;line-height:1.6;">Your password was successfully changed on <strong>${date}</strong>.</p>
        <p style="font-size:16px;line-height:1.6;">If you did not make this change, please contact support immediately.</p>
        <p style="margin-top:30px;text-align:center;">
          <a href="${process.env.FRONTEND_URL}" style="background:#0d4b8f;color:#fff;text-decoration:none;padding:14px 24px;border-radius:6px;display:inline-block;font-weight:bold;">Visit Sharps</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#f0f4f8;color:#666;padding:18px;font-size:12px;text-align:center;">
        Sharps Collections
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

module.exports = {
  forgotPasswordMail,
  passwordResetConfirmationMail,
};
