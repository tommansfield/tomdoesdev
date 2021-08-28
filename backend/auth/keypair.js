const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

exports.generateKeyPair = (done) => {
  const privateKeyPath = path.join(__dirname, "..", "id_rsa_priv.pem");
  const publicKeyPath = path.join(__dirname, "..", "id_rsa_pub.pem");
  let message = "Checking for public/private keypair..";
  try {
    if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
      console.log(`${message} keys found.`);
      done();
    } else {
      console.log(`${message} no keys found.`);
      message = "-- Creating new public/private keypair..";
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
      fs.writeFile(privateKeyPath, keyPair.privateKey, () => {
        fs.writeFile(publicKeyPath, keyPair.publicKey, () => {
          console.log(`${message} done.`);
          done();
        });
      });
    }
  } catch (err) {
    console.log(`${message} ${err.message}`);
  }
};
