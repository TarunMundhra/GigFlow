import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { ApiError } from "./utils/apiError.js"

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
import bidRouter from "./routes/bid.route.js"
import gigRouter from "./routes/gig.route.js"


app.use("/api/users",userRouter)
app.use("/api/bids", bidRouter)
app.use("/api/gigs", gigRouter)

// 404 route
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
  console.log("Route not found", req.method, req.originalUrl);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err?.stack || err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

export { app }