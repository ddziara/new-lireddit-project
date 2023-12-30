"use strict";
import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, html: string, text: string) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  //   let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
/*  let transporter2 = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.ETHEREAL_USER, // generated ethereal user
      pass: process.env.ETHEREAL_PASSWORD, // generated ethereal password
    },
  });*/

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      /* indicates authentication type, set it to ‘OAuth2’ */
      type: "OAuth2",

      /* user email address (required) */
      user: process.env.USER_EMAIL,

      /* is the registered client id of the application */
      clientId: process.env.CLIENT_ID,

      /* is the registered client secret of the application */
      clientSecret: process.env.CLIENT_SECRET,

      /* is an optional refresh token. If it is provided then Nodemailer          */
      /* tries to generate a new access token if existing one expires or fails    */
      refreshToken: process.env.REFRESH_TOKEN,

      /* is the access token for the user. Required only if refreshToken is not   */
      /* available and there is no token refresh callback specified               */
      // accessToken: process.env.ACCESS_TOKEN,

      /* is an optional expiration time for the current accessToken               */
      // expires: ,

      /* is an optional HTTP endpoint for requesting new access tokens.           */
      /* This value defaults to Gmail                                             */
      // accessUrl: ,
      },
  });
  
  // console.log("transporter: ", transporter);

  /**********************************************************************************/
  /* If you do not want Nodemailer to create new access tokens then you can provide */
  /* a custom token generation callback that is called every time a new token is    */
  /* needed for an user.                                                            */
  /*                                                                                */
  /* * user – is the user email address                                             */
  /* * renew – if true then previous access token either expired or it was not      */
  /*           accepted by the SMTP server, in this case you should generate a new  */ 
  /*           value                                                                */
  /* * callback - with arguments (err, accessToken) – is the callback function to   */
  /*              run once you have generated a new access token                    */
  /**********************************************************************************/
  /*transporter.set("oauth2_provision_cb", (user, renew, callback) => {
    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
    console.log("user", user)
    console.log("renew", renew)
    // let accessToken = userTokens[user];
    // if (!accessToken) {
    //   return callback(new Error("Unknown user"));
    // } else {
    //   return callback(null, accessToken);
    // }
  });*/

  // console.log("#2");

  /**********************************************************************************/
  /* If you use refreshToken or service keys to generate new tokens from Nodemailer */ 
  /* when accessToken is not present or expired then you can listen for the token   */ 
  /* updates by registering a ‘token’ event handler for the transporter object.     */
  /**********************************************************************************/
  transporter.on("token", (token) => {
    console.log("A new access token was generated");
    console.log("User: %s", token.user);
    console.log("Access Token: %s", token.accessToken);
    console.log("Expires: %s", new Date(token.expires));
  });

  // console.log("#3");

  try {
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"liReddit 👻" <noreply@xxyyzz.com>', // sender address
    to, // list of receivers
    subject: "Change password", // Subject line
    html,
    text,
  });
  // console.log("Message sent: %s", info.messageId);
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  // console.log("info: ", info);
  }
  catch(err) {
    console.log(err)
  }
}
