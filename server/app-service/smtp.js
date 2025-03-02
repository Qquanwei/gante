const nodemailer = require('nodemailer');

module.exports = async function(app) {
  app.smtp = (() => {

    const MAIL_USER = process.env.GANTE_MAIL_USER;
    const MAIL_PASS = process.env.GANTE_MAIL_PASS;

    if (!MAIL_USER || !MAIL_PASS) {
      console.log('未配置SMTP用户信息，无法使用邮件功能');
    }

    async function sendMail(receiver, subject, plainContent, content) {
      console.log('开始发送邮件')
      const transporter = nodemailer.createTransport({
        host: "smtpdm.aliyun.com",
        port: 465,
        secure: true, // true for port 465, false for other ports
        auth: {
          user: MAIL_USER,
          pass: MAIL_PASS,
        },
      });
      await transporter.sendMail({
        from: '"Gante Daily Mail" <agenda@mail.gante.link>', // sender address
        to: receiver, // list of receivers
        subject: subject, // Subject line
        text: plainContent, // plain text body
        html: content, // html body
      });
      console.log('邮件发送成功')
    }
    return {
      sendMail
    }
  })();
}
