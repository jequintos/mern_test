import auth from "./routes/api/auth";
import bodyParser from "body-parser";
import connectDB from "../config/database";
import express from "express";
import profile from "./routes/api/profile";
import todo from "./routes/api/todo";
import user from "./routes/api/user";

const app = express();

// Connect to MongoDB
connectDB();

// Express configuration
app.set("port", process.env.PORT || 5000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// @route   GET /
// @desc    Test Base API
// @access  Public
app.get("/", (_req, res) => {
  res.send("API Running");
});

app.get("/test/", (_req, res) => {
  res.send("wutface");
});

app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/profile", profile);
app.use("/api/todo", todo);

const port = app.get("port");
const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

export default server;
