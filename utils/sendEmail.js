const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
    const transporter = nodeMailer.createTransport({
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
        },
        // secure: false // add this line to disable secure connection
      });

    const mailOptins = {
        from: process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    await transporter.sendMail(mailOptins);
};

module.exports = sendEmail;

// async function first() {
//     await console.log("1");
//     console.log("2");
// };

// console.log("start");
// first()
// console.log("3");
