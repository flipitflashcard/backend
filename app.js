const express = require("express");
const cors = require("cors");
const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());


const user_routes = require("./routes/user-routes");
app.use("/api/users", user_routes);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
