export {};

const nodemailer = require("nodemailer");
const {
    google
} = require("googleapis");
const CLIENT_ID_MAIL = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET_MAIL = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const CANVERRO_SEND_MAIL = process.env.CANVERRO_SEND_MAIL;


const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID_MAIL,
    CLIENT_SECRET_MAIL,
    REDIRECT_URI
);
oAuth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
});

module.exports = async function sendMail(to: any, subject: any, text: any) {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: CANVERRO_SEND_MAIL,
                clientId: CLIENT_ID_MAIL,
                clientSecret: CLIENT_SECRET_MAIL,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });


        const mailOptions = {
            from: "",
            to: to,
            subject: subject,
            text: text,
            html: `<p> Welcome to Canverro you are registered successfully!!! </p>`,
        };

        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (error) {
        return error;
    }
};
