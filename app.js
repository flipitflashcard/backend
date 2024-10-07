BigInt.prototype.toJSON = function () {
    return Number(this);
}

const cookieParser = require('cookie-parser');
const express = require("express");
const cors = require("cors");
const app = express();
const port = 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());


const user_routes = require("./routes/user-routes");
app.use("/api/users", user_routes);

const box_routes = require("./routes/box-routes");
app.use("/api/boxes", box_routes);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
