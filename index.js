import express from 'express';
import { Client, auth } from "twitter-api-sdk";

const app = express();

/**
 * @param {number} length
 * @returns {string} PKCE state
 */
export const generatePKCEState = (length) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let state = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    state += charset[randomIndex];
  }
  return state;
}

//OAuth 2.0 Client ID and Client Secret 
// https://developer.twitter.com/en/portal/dashboard
const client_id = 'YOUR_CLIENT_ID';
const STATE = generatePKCEState(50);

const authClient = new auth.OAuth2User({
  client_id: client_id,
  callback: "http://localhost:3000/callback",
  scopes: ["tweet.read", "users.read", "offline.access"],
});

const client = new Client(authClient);

app.get("/callback", async function (req, res) {
  try {
    const { code, state } = req.query;
    if (state !== STATE) return res.status(500).send("State isn't matching");
    await authClient.requestAccessToken(code);
    res.redirect("/user");
  } catch (error) {
    console.log(error);
  }
});

app.get("/login", async function (req, res) {
  const authUrl = authClient.generateAuthURL({
    state: STATE,
    code_challenge_method: "plain",
    code_challenge: "test",
  });
  res.redirect(authUrl);
});

app.get("/user", async function (req, res) {
  try {
    const users = await client.users.findMyUser();
    console.log(users);
    res.send(users);
  } catch (error) {
    console.log("user error", error);
  }
});

app.listen(3000, () => {
  console.log(`Go here to login: http://localhost:3000/login`);
});