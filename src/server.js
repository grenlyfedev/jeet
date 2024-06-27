import express from "express";
import configViewEngine from "./config/configEngine";
import routes from "./routes/web";
import cronJobContronler from "./controllers/cronJobContronler";
import socketIoController from "./controllers/socketIoController";
const bodyParser = require('body-parser');
import { router as adminRouter } from "./routes/adminRouter.js";

const cors = require('cors');

require("dotenv").config();
let cookieParser = require("cookie-parser");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(cors());

// app.use(express.static('public'));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// setup viewEngine
configViewEngine(app);
// init Web Routes

app.use("/admin", adminRouter);
routes.initWebRouter(app);

// Cron game 1 Phut
cronJobContronler.cronJobGame1p(io);

// Check xem ai connect vào sever
socketIoController.sendMessageAdmin(io);

app.all("*", (req, res) => {
  return res.render("404.ejs");
});

server.listen(port, () => {
  console.log("Connected success port: " + port);
});
