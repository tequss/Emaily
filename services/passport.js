const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy
const keys = require('../config/keys');
const mongoose = require('mongoose');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {  //zapisuje userID(token) do mongodb 

    done(null, user.id);

});

passport.deserializeUser((id, done) => {

    User.findById(id).then(user => {
        done(null, user);
    })
});

passport.use(
    new GoogleStrategy(
        {
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: '/auth/google/callback',
            proxy: true
        },
        (accessToken, refreshToken, profile, done) => {
            User.findOne({ googleId: profile.id })
                .then((existingUser) => {
                    if (existingUser) {
                        //we already heave a record with the given profile ID
                        done(null, existingUser);
                    } else {
                        // we don't have a user record with given profile ID, make a new record
                        new User({ googleId: profile.id })      //save user to mangoDB
                            .save()
                            .then(user => done(null, user));
                    }

                })


        }
    ));