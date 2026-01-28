import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());

// Save data
app.post("/save", (req, res) => {
    fs.writeFileSync("data.json", JSON.stringify(req.body, null, 2));
    res.send("Saved");
});

// Load data
app.get("/load", (req, res) => {
    const data = JSON.parse(fs.readFileSync("data.json", "utf8"));
    res.json(data);
});

app.listen(3000, () => console.log("Server running"));
