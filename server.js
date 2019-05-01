const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");

connectDB();

app.use(express.json({ extended: false }));

app.get("/", (req, res) => res.send("API Running ..."));

//define route
app.use("/api/users", require("./routes/users"));
app.use("/api/profile", require("./routes/profiles"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));

app.listen(PORT, () => console.log("server is running"));
