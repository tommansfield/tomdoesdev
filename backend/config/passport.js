const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const fs = require("fs");
const path = require("path");
const keys = require("./keys");
const User = require("mongoose").model("User");
const Provider = require("../util/enums").provider;

const publicKeyPath = path.join(__dirname, "..", keys.publicKey);
const PUB_KEY = fs.readFileSync(publicKeyPath, "utf8");

const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ["RS256"],
  },
  (payload, done) => {
    console.log("authenticating..");
    User.findById({ _id: payload.sub }, (err, user) => {
      if (user) {
        return done(null, user);
      }
      if (!err) {
        err = { status: 401, message: "The token provided corresponds to a user that doesn't exist" };
      }
      return done(err, false);
    });
  }
);

const facebookStrategy = new FacebookStrategy(
  {
    clientID: keys.facebook.clientId,
    clientSecret: keys.facebook.clientSecret,
    callbackURL: keys.facebook.callbackUrl,
    profileFields: ["name", "photos", "email"],
  },
  function (accessToken, refreshToken, facebookProfile, done) {
    if (!facebookProfile.emails) {
      const error = "No email address was provided by Facebook";
      return done(error, null);
    }
    const email = facebookProfile.emails[0].value;
    let newUser = false;
    User.findOne({ email }, (err, user) => {
      if (err) {
        next(err);
      }
      if (!user) {
        newUser = true;
        user = new User({ email });
        user.profile = extractUserProfile(facebookProfile);
      }
      user.save((err, savedUser) => {
        if (err) {
          return done(err, false);
        }
        if (newUser) {
          console.log(`Successfully signed up new Facebook user: ${newUser.email}.`);
        }
        return done(err, savedUser);
      });
    });
  }
);

const extractUserProfile = function (profile) {
  return {
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    photoUrl: profile.photos[0].value,
  };
};

passport.use(Provider.LOCAL, jwtStrategy);
passport.use(Provider.FACEBOOK, facebookStrategy);

module.exports = passport;
