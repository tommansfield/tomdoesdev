const appUrl = process.env.APP_URL;

const keys = {
  privateKey: "id_rsa_priv.pem",
  publicKey: "id_rsa_pub.pem",
  sslKey: "server.key",
  sslCertificate: "server.crt",
  database: {
    url: "__MONGO_URL__",
    username: "__MONGO_USERNAME__",
    password: "__MONGO_PASSWORD__",
  },
  facebook: {
    clientId: "__FACEBOOK_CLIENTID__",
    clientSecret: "__FACEBOOK_CLIENTSECRET__",
    callbackUrl: `${appUrl}/auth/facebook/callback`,
  },
  google: {
    clientId: "__GOOGLE_CLIENTID__",
    clientSecret: "__GOOGLE_CLIENTSECRET__",
    callbackUrl: `${appUrl}/auth/google/callback`,
  },
  github: {
    clientId: "__GITHUB_CLIENTID__",
    clientSecret: "__GITHUB_CLIENTSECRET__",
    callbackUrl: `${appUrl}/auth/github/callback`,
  },
  microsoft: {
    clientId: "__MICROSOFT_CLIENTID__",
    clientSecret: "__MICROSOFT_CLIENTID__",
    callbackUrl: `${appUrl}/auth/microsoft/callback`,
  },
  twitter: {
    clientId: "__TWITTER_CLIENTID__",
    clientSecret: "__TWITTER_CLIENTSECRET__",
    callbackUrl: `${appUrl}/auth/twitter/callback`,
  },
};

module.exports = keys;
