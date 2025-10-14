import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
import dbConnect from "./config/dbConfig.js"
import cors from "cors"
import authRoute from "./routes/authRoutes.js"
import aiRoute from "./routes/aiRoutes.js"
import chatRoute from"./routes/chatRoutes.js"
import adminRoute from "./routes/admin.js"

const app=express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json())

dbConnect();

app.use('/api/auth',authRoute)
app.use('/api/openrouter',aiRoute)
app.use("/api/chat",chatRoute)
app.use("/api/admin",adminRoute)
export default app;
