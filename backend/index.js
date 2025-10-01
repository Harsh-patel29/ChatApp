import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const port = process.env.PORT || 4000;
app.use(express.json());

app.listen(port, () => {
  console.log("App is listening to", `http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("Chat App backend Running...✅");
});
