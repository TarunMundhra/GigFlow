import dotenv from "dotenv";
dotenv.config('./.env');
import connectDB from "./db/index.js";
import {app} from './app.js'


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 6000,() =>{
        console.log(` Server is running on the port: ${process.env.PORT}`);
    })
})
.catch((err) =>{
    console.log(" MONGODB DATABASE CONNECTION FAILED !!",err);
})
