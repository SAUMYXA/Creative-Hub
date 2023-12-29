export {};

const jwt = require("jsonwebtoken");
const User = require("../model/userModel");


const apiDocsAuth = async (req:any,res:any,next:any)=>{
    try{
        if(!req.cookies["Authorization"]){
            console.log("render login page");
            return res.render('login',{apiDocs:true});
        }
        const token = req.cookies["Authorization"].replace("Bearer ", "");
        console.log("apiDocAuthToken",token);
        if(!token){
            return res.status(401).send("Access Denied");        
        } else {
            const verifyUser = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({
                token: verifyUser._id,
            });
            req.user = user;
            console.log("User is Authorized");
            next();
        }
    }catch(err){
        console.log(err);
        res.status(401).send(err);
    }
};

module.exports = apiDocsAuth;
