const mongoose=require('mongoose');

async function connectDb(){
    try {
        await mongoose.connect(process.env.MONGOOSE_URI)
    } catch (error) {
        console.log('Error connecting to database',error)

    }
}

module.exports=connectDb;
