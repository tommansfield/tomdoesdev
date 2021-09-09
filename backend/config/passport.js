const fs = require("fs");
const path = require("path");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("mongoose").model("User");
const Provider = require("../util/enums").provider;

const publicKeyPath = path.join(__dirname, "..", process.env.PUBLIC_KEY_PATH);

const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: fs.readFileSync(publicKeyPath, "utf8"),
    algorithms: ["RS256"],
  },
  (payload, done) => {
    User.findById({ _id: payload.sub }, (err, user) => {
      if (user) {
        return done(null, user);
      }
      if (!err) {
        err = {
          status: 401,
          message: "The token provided corresponds to a user that doesn't exist",
        };
      }
      return done(err, false);
    });
  }
);

const facebookStrategy = new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
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

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  function (request, accessToken, refreshToken, profile, done) {
    if (!profile.emails) {
      const error = "No email address was provided by Facebook";
      return done(error, null);
    }
    const email = profile.emails[0].value;
    let newUser = false;
    User.findOne({ email }, (err, user) => {
      if (err) {
        next(err);
      }
      if (!user) {
        newUser = true;
        user = new User({ email });
        user.profile = extractUserProfile(profile);
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
passport.use(Provider.GOOGLE, googleStrategy);

module.exports = passport;
