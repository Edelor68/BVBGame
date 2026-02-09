import express from "express";
import fs from "fs";

const app = express();

app.use(express.static("public"));
app.use(express.json());

app.post("/save/:file", (req, res) => {
    const file = req.params.file;

    // Security: prevent directory traversal
    if (!/^[a-zA-Z0-9_-]+\.json$/.test(file)) {
        return res.status(400).send("Invalid filename");
    }
    console.log("Saving")
    fs.writeFileSync(`data/${file}`, JSON.stringify(req.body));
    res.send("Saved");
});

app.get("/load/:file", (req, res) => {
    const file = req.params.file;

    if (!/^[a-zA-Z0-9_-]+\.json$/.test(file)) {
        return res.status(400).send("Invalid filename");
    }

    const path = `data/${file}`;

    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "{}");
    }

    const data = JSON.parse(fs.readFileSync(path, "utf8"));
    res.json(data);
});


app.listen(3000, () => console.log("Server running"));
