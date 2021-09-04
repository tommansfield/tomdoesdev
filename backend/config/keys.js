const appUrl = process.env.APP_URL;

const keys = {
  privateKey: "/auth/keys/id_rsa_priv.pem",
  publicKey: "/auth/keys/id_rsa_pub.pem",
  sslKey: "/auth/keys/server.key",
  sslCertificate: "/auth/keys/server.crt",
  database: {
    url: "cluster0.t4j8r.mongodb.net",
    username: "admin",
    password: "gYHupavZqdKyHqB2",
  },
  facebook: {
    clientId: "1653242078203037",
    clientSecret: "fdc7b07a54642b57c204d71c636f8f91",
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
