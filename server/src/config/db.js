import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`Successfully connect to the mongoDB database !! DB Host : ${connectionInstance.connection.host}`);
    }catch(error){
        console.log(`Error : ${error}, \n Connection to the database failed`);
        process.exit(1);
    }
}

export default connectDB;