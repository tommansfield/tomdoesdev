const passport = require("passport");
const fs = require("fs");
const path = require("path");
const User = require("mongoose").model("User");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const keys = require("./keys");

const publicKeyPath = path.join(__dirname, "..", keys.publicKey);
const PUB_KEY = fs.readFileSync(publicKeyPath, "utf8");

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ["RS256"],
};

const jwtStrategy = new JwtStrategy(options, (payload, done) => {
  User.findById({ _id: payload.sub }, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
});

passport.use(jwtStrategy);
module.exports = passport;
