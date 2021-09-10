const fs = require("fs");
const path = require("path");
const passport = require("passport");
const authService = require("../services/auth.service");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
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
  (accessToken, refreshToken, profile, done) => {
    const provider = Provider.FACEBOOK;
    authService.createOrUpdateSocialUser({ profile, provider }, done);
  }
);

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  (request, accessToken, refreshToken, profile, done) => {
    const provider = Provider.GOOGLE;
    authService.createOrUpdateSocialUser({ profile, provider }, done);
  }
);

const githubStrategy = new GithubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
  },
  (accessToken, refreshToken, profile, done) => {
    const provider = Provider.GITHUB;
    authService.createOrUpdateSocialUser({ profile, provider }, done);
  }
);

const twitterStrategy = new TwitterStrategy(
  {
    consumerKey: process.env.TWITTER_CLIENT_ID,
    consumerSecret: process.env.TWITTER_CLIENT_SECRET,
    userProfileURL: process.env.TWITTER_PROFILE_URL,
    callbackURL: process.env.TWITTER_CALLBACK_URL,
  },
  (token, tokenSecret, profile, done) => {
    const provider = Provider.TWITTER;
    authService.createOrUpdateSocialUser({ profile, provider }, done);
  }
);

passport.use(Provider.LOCAL, jwtStrategy);
passport.use(Provider.FACEBOOK, facebookStrategy);
passport.use(Provider.GOOGLE, googleStrategy);
passport.use(Provider.GITHUB, githubStrategy);
passport.use(Provider.TWITTER, twitterStrategy);

module.exports = passport;
