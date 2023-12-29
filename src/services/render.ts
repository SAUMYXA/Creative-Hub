// const axios = require('axios');
// HomeRoute Call back
exports.homeRoutes = (req: any, res: any) => {
    res.send("This is home route ur Welcome!!!");
}

// user login Call back
exports.loginRoute = (req: any, res: any) => {
    res.send("user is login in here");
}

// user register Call back
exports.registerRoute = (req: any, res: any) => {
    res.send("user is register in here");
}

// user register Call back
exports.forgotPassword = (req: any, res: any) => {
    res.render('forgot-password')
    res.send("Forgot Password Route");
}

// Afte authorization user profile shown with user detailes 

exports.showProfile = (req: any, res: any) => {
    res.send("this is users profile");
}