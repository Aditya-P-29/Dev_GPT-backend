
import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";



const app = express();
const PORT = 8080;

app.use(express.json());


app.use(cors({
  origin: "https://devgpt.vercel.app" // your actual Vercel URL
}))

app.use("/api", chatRoutes);

app.use("/api/auth", authRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected with database");
  } catch (err) {
    console.log("failed to connect with database", err);
  }
};

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
  });
};

start();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
});



//app.post("/test", async (req, res) => {
//   try {
//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, // must be loaded from .env
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "openai/gpt-oss-120b:free",
//         messages: [
//           { role: "user", content: req.body.message || "Difference between SQL and MongoDB" }
//         ],
//         stream: false,
//       }),
//     });

//     const completion = await response.json();

//     if (completion.choices && completion.choices.length > 0) {
//       return res.json({ output: completion.choices[0].message.content });
//     } else {
//       return res.status(500).json({ error: "Unexpected response", details: completion });
//     }
//   } catch (err) {
//     console.error("OpenRouter error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
//});

