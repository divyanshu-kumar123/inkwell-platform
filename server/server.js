import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import { errorHandler } from './src/middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import userRouter from './src/routes/user.routes.js'
import publicationRouter from './src/routes/publication.routes.js';

//Load the environment variables
dotenv.config();

//Initializing the database connections
connectDB();

//declaring app -- express
const app = express();

//Middlewares
app.use(cors({
    origin : 'http://localhost:5173', //frontend url
    credentials : true
}))

app.use(express.json({limit : '16kb'}));
app.use(express.urlencoded({extended:true, limit : '16kb'}));
app.use(cookieParser());

// ROUTER SETUP
app.use("/api/v1/users", userRouter);
app.use("/api/v1/publications", publicationRouter); 

//Centalized error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=>{
    console.log(`Server is running on the port ${PORT}`)
})

