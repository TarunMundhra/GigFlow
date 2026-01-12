import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({
    limit : "16kb"
}))
app.use(express.urlencoded({extended:true,limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routers
import userRouter from "./routes/user.route.js"

app.use("/api/v1/users",userRouter)


app.use((req, res) => {
  res.status(404).json({ message: "Route not found !!" });
  console.log("Route not found" , req.method , req.originalUrl);
});

export {app}