const environment = {
  DEV: "development",
  PROD: "production",
};

const provider = {
  ADMIN: "Admin",
  LOCAL: "Local",
  FACEBOOK: "Facebook",
  GOOGLE: "Google",
  MICROSOFT: "Microsoft",
  GITHUB: "Github",
  TWITTER: "Twitter",
};

// const provider = {
//   ADMIN: {
//     name: "Admin",
//     strategy: "jwt",
//   },
//   LOCAL: {
//     name: "Local",
//     strategy: "jwt",
//   },
//   FACEBOOK: {
//     name: "Facebook",
//     strategy: "jwt",
//   },
//   GOOGLE: {
//     name: "Google",
//     strategy: "jwt",
//   },
//   MICROSOFT: {
//     name: "Microsoft",
//     strategy: "jwt",
//   },
//   GITHUB: {
//     name: "Github",
//     strategy: "jwt",
//   },
//   TWITTER: {
//     name: "Twitter",
//     strategy: "jwt",
//   },
// };

module.exports = { environment, provider };
