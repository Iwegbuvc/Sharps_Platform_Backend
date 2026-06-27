const { BrevoClient } = require("@getbrevo/brevo");

async function sendMail(to, subject, htmlContent, toName = "") {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not set in environment");
  }
  if (!process.env.BREVO_FROM_EMAIL) {
    throw new Error("BREVO_FROM_EMAIL is not set in environment");
  }

  const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
  });

  const recipientName = toName?.trim() || "Sharps Customer";
  const payload = {
    sender: {
      email: process.env.BREVO_FROM_EMAIL,
      name: "Sharps Collections",
    },
    to: [{ email: to, name: recipientName }],
    subject,
    htmlContent,
    textContent: htmlContent.replace(/<[^>]+>/g, ""),
  };

  return brevo.transactionalEmails.sendTransacEmail(payload);
}

module.exports = sendMail;
