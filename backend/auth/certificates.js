const pem = require("pem");

module.exports.createCertificate = (done) => {
  pem.createCertificate({ days: 1, selfSigned: true }, (err, keys) => {
    if (!keys) {
      return done();
    }
    const credentials = keys ? { key: keys.serviceKey, cert: keys.certificate } : {};
    done(credentials);
  });
};
