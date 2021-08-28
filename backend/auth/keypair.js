const crypto = require("crypto");
const fs = require("fs");

exports.generateKeyPair = (done) => {
  const privateKeyPath = `${__dirname}/keys/id_rsa_priv.pem`;
  const publicKeyPath = `${__dirname}/keys/id_rsa_pub.pem`;
  let message = "Checking for public/private keypair..";
  try {
    if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
      console.log(`${message} keys found.`);
    } else {
      console.log(`${message} no keys found.`);
      message = "Creating public/private keypair..";
      const keyPair = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
      });
      fs.writeFileSync(privateKeyPath, keyPair.privateKey);
      fs.writeFileSync(publicKeyPath, keyPair.publicKey);
      console.log(`${message} done.`);
      done();
    }
  } catch (err) {
    console.log(`${message} ERROR: ${err.message}`);
  }
};
