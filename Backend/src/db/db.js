const mongoose = require('mongoose');

async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB with srv');
    }catch(err){
        console.log("Error connecting to srv..")
        console.log("connecting to Nonsrv..")
        try{
            await mongoose.connect(process.env.MONGO_URL)
            console.log('Connected to MongoDB with Nonsrv');
        }catch(err){
            console.log("Error connecting to both...",err);
        }
    }
}

module.exports = connectDB ;