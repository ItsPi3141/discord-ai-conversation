const express = require("express");
const { reset } = require("./index.js");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
	res.send("OK");
});
app.get("/reset", (req, res) => {
	reset();
	res.send("OK");
});
app.listen(port, () => {
	console.log(`Server is up and running on port ${port}`);
});
