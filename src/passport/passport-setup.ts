export {};

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
//load user model
const User = require('../model/userModel')
const sendMail = require("../middleware/mail");
// Serializing and deserializing user for quick login and stay loggedin
passport.serializeUser(function (user: any, done: any) {

    /*
    From the user take just the id (to minimize the cookie size) and just pass the id of the user
    to the done callback
    PS: You dont have to do it like this its just usually done like this
    */
    done(null, user.id);
});
passport.deserializeUser(function (id: any, done: any) {
    /*
    Instead of user this function usually recives the id
    then you use the id to select the user from the db and pass the user obj to the done callback
    PS: You can later access this data in any routes in: req.user
    */
    User.findById(id, (err: any, user: any) => {

        done(null, user);
    })
});

// Google Statargy for login with google
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
        passReqToCallback: true
    }, function (accessToken:any, refreshToken:any, profile:any, cb:any) {
        console.log(profile);
        // console.log(profile.emails[0].value);
        // User.find({}).then((p) => { console.log(p);}).catch((e)=>{console.log(e)});
        User.findOne(
          { username: profile.emails[0].value },
          function (err:any, foundUser:any) {
            if (foundUser) {
            } else {
              sendMail(
                process.env.ZIGY_RECIEVE_NEWUSER,
                `${profile.emails[0].value} has registered in the site`,
                `${profile.emails[0].value} has registered in the site`,
                `${profile.name.givenName},"3"`
              );
              sendMail(
                profile.emails[0].value,
                `Welcome to zigy ${profile.name.givenName}`,
                `Welcome to zigy ${profile.name.givenName}`,
                profile.name.givenName,
                "1"
              )
              .then((result:any) => console.log("Email sent...", result))
                .catch((error:any) => console.log(error.message));
            }
            // console.log(foundUser);
          }
        );
      },
    async (request: any, accessToken: any, refreshToken: any, profile: any, done: any)=> {
        const user = await User.findOne({googleId: profile.id});
        if(user){
            user.accessToken = accessToken;
            await user.save();
            return done(null,user);
        }
        const newUser = new User({
            googleId: profile.id,
            name:profile.displayName,
            email:profile.emails[0].value,
            accessToken:accessToken,
            refreshToken:refreshToken,
            password:profile.id,
            typeOfLogin:"Google",
        });
        await newUser.save();
        return done(null, newUser);
    }
));

// Google Local login Statargy 
passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    async (email: any, password: any, done: any) => {
        try {
            const user = await User.findOne({
                email: email
            });
            if (!user) return done(null, false, {
                msg: 'the email do not exists!'
            })
            bcrypt.compare(password, user.password, (err: any, isMatch: any) => {

                console.log(password);
                console.log(user);
                console.log(isMatch);

                if (err) throw err;

                if (isMatch) {
                    console.log("User Successful Logged in")
                    return done(null, user);
                } else {
                    // console.log("password in correct")
                    return done(null, false, {
                        msg: "Password is incorrect"
                    })
                }
            });
        } catch (err: any) {
            console.log("Error in passport " + err.message);
        }
        // User.findOne({
        //     email: email
        // }).then(
        //     user => {
        //         if (!user) return done(null, false, {
        //             msg: 'the email do not exists!'
        //         })
        //         //match password
        //         bcrypt.compare(password, user.password, (err, isMatch) => {
        //             if (err) throw err;

        //             if (isMatch) {
        //                 // console.log("User Successful Logged in")
        //                 return done(null, user);
        //             } else {
        //                 // console.log("password in correct")
        //                 return done(null, false, {
        //                     msg: "Password is incorrect"
        //                 })
        //             }
        //         });
        //     }
        // ).catch(err => console.log(err));
    }
))

// function sendMail(ZIGY_RECIEVE_NEWUSER: string | undefined, arg1: string, arg2: string, arg3: string) {
//     throw new Error("Function not implemented.");
// }
