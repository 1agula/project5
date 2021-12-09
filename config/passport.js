const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const localStrategy = require("passport-local");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  console.log(user);
  console.log("Serializing user now.");
  done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  console.log("Deserializing user now.");
  User.findById({ _id }).then((user) => {
    console.log("Found User.");
    done(null, user);
  });
});

passport.use(
  new localStrategy((username, password, done) => {
    console.log(username, password);
    User.findOne({ email: username })
      .then(async (user) => {
        if (!user) {
          return done(null, false);
        }
        await bcrypt.compare(password, user.password, function (err, result) {
          if (!result) {
            done(null, falsew);
          }
          done(null, user);
        });
      })
      .catch((err) => {
        done(null, false);
        console.log(err);
      });
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      // console.log(profile);
      User.findOne({ googleID: profile.id }).then((user) => {
        if (user) {
          console.log("User already exist.");
          done(null, user);
        } else {
          new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleID: profile.id,
            thumbnail: profile.photos[0].value,
          })
            .save()
            .then((user) => {
              // console.log("New User Created.");
              done(null, user);
            });
        }
      });
    }
  )
);
