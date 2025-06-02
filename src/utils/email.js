const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

module.exports = async ({ to, subject, templateName, replacements }) => {
  const templatePath = path.join(strapi.dirs.app.root, 'src', 'email-templates', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf8');

   const baseUrl = process.env.EMAIL_TEMPLATE_BASE_URL || '';
  html = html.replace(/{{baseUrl}}/g, baseUrl);

  // Replace placeholders
  for (const [key, value] of Object.entries(replacements)) {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.AWS_SES_USER,
      pass: process.env.AWS_SES_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.AWS_SES_EMAIL_FROM,
    to,
    subject,
    html,
  });
};
