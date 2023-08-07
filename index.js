const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const connectToDb = require("./db");
const app = express();
const cors = require("cors");


app.use(express.json());
app.use(cors());

const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const addressRoute = require("./routes/address");
const productRoute = require("./routes/product");
const subcatRoute = require("./routes/subcat");
const orderRoute = require("./routes/order");
const messageRoute = require("./routes/message");

connectToDb();



app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/address", addressRoute);
app.use("/product", productRoute);
app.use("/subcat", subcatRoute);
app.use("/order", orderRoute);
app.use("/message", messageRoute);

app.listen(
  process.env.PORT,
  console.log(`server is running on port ${process.env.PORT}`)
);
