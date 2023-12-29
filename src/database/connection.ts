export {};

const mongoose = require('mongoose');
const customlog=require("../controller/loggerController")


const connectDB = async (req: any,res: any) => {
    try {
        // mongodb connection string

        const con = await mongoose.connect(process.env.MONGO_URI, {
            // to stop unwanted warnings in to console including some properties
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useFindAndModify: false,
            // useCreateIndex: true
        })
        console.log(`MongoDB connected : ${con.connection.host}`);
    } catch (err : any) {
        res.json({error: err})
        process.exit(1);
    }
}
mongoose.set('strictQuery', true);

module.exports = connectDB