import { Router } from "express";
import {
  getAllUserData,
  getAllRechargeDetails,
} from "../controllers/adminController.js";
import { protect, getUserInfo } from "../controllers/userController.js";
import { defaultPagination } from "../utils/defaultPagination.js";
// import {
//   crashedPlaneSettings,
//   getCrashedPlaneSettings,
// } from "../controllers/aviatorController.js";
import {
  getPaymentDetails,
  setGatewayKey,
  getTransectionDetails,
  getGatewayKey,
  setPaymentGateWay,
  doPayment,
} from "../controllers/gatewayController.js";
import {
  get5dHistory,
  getK3History,
  getWingoHistory,
} from "../controllers/moreController.js";
const router = Router();

// ==== routes setup =====
router
  .get("/alluserdata", defaultPagination, getAllUserData)
  .get("/getallrecharge", defaultPagination, getAllRechargeDetails);
// .post("/crashed", crashedPlaneSettings)
// .get("/getcrashed", getCrashedPlaneSettings)

// gatewayController
router
  .get("/getpaymentdetails", getPaymentDetails, getTransectionDetails)
  .post("/setgateway", setGatewayKey)
  .get("/getgatewaykey", getGatewayKey)
  .post("/setpaymentgateway", setPaymentGateWay)
  .post("/proxy/create_order", doPayment);

// get user info api
router.get("/userinfo", protect, getUserInfo);

// game k3, wingo , 5d history
router
  .get("/k3history", getK3History)
  .get("/5dhistory", get5dHistory)
  .get("/wingohistory", getWingoHistory);
export { router };
