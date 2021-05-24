require("dotenv").config();
const OpenTok = require("opentok");
const opentok = new OpenTok(
  process.env.OPENTOK_API_KEY,
  process.env.OPENTOK_API_SECRET
);

let sessionId ='2_MX40NzIwNTYyNH5-MTYyMTQ1OTkwOTUxMX4zSlVxem9ySHFlUjZkK2xMdE9zVENrd2h-fg'

// const getTheGoods = () => {
//   return new Promise((res, rej) => {
//     if (!sessionId) {
//       opentok.createSession(function (err, session) {
//         if (err) {
//           console.log(err);
//           rej(err);
//         }
//         sessionId = session.sessionId;

//         const token = opentok.generateToken(sessionId);

//         res({
//           apiKey: process.env.OPENTOK_API_KEY,
//           sessionId,
//           token,
//           deepARKey: process.env.DEEPAR_KEY,
//         });
//       });
//     } else {
//       const token = opentok.generateToken(sessionId);

//       res({
//         apiKey: process.env.OPENTOK_API_KEY,
//         sessionId,
//         token,
//         deepARKey: process.env.DEEPAR_KEY,
//       });
//     }
//   });
// };


let video_token = 'T1==cGFydG5lcl9pZD00NzIwNTYyNCZzaWc9MTgwNzEwYWY4NDRhZjY4NjliNjhmMjlhNzNjMzAxNjUzNzg2NjFkNDpzZXNzaW9uX2lkPTJfTVg0ME56SXdOVFl5Tkg1LU1UWXlNVFExT1Rrd09UVXhNWDR6U2xWeGVtOXlTSEZsVWpaa0syeE1kRTl6VkVOcmQyaC1mZyZjcmVhdGVfdGltZT0xNjIxNDYwODE2Jm5vbmNlPTAuMzg4NTUxNzkwODY5MTU0MDMmcm9sZT1tb2RlcmF0b3ImZXhwaXJlX3RpbWU9MTYyNDA1MjgxNSZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=='

const getTheGoods = () => {
  return new Promise((res, rej) => {
      // const token = opentok.generateToken(sessionId);
      res({
        apiKey: process.env.OPENTOK_API_KEY,
        sessionId : process.env.OPENTOK_API_SESSIONID,
        token:process.env.OPENTOK_API_TOKEN,
        deepARKey: process.env.DEEPAR_KEY,
      });
  });
};

module.exports = getTheGoods;
