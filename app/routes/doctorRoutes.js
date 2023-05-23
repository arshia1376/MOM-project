const multer = require("multer");
const router = require('express').Router();
const doctorController = require('../http/controller/doctorController');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const Auth = require("../http/middleware/Auth");
const LockTIme=require("../http/middleware/lockTime")

router.get("/sendCode", Auth, doctorController.SendCode);

router.get("/time",LockTIme, doctorController.time);

router.post("/verifyCode/:id", Auth, doctorController.VerifyCode);

router.post("/login", doctorController.Login);

router.post("/register", doctorController.Register);
// router.post("/foods/photo",[Auth,RestaurantAdmin,],controller.setFoodPhoto)


module.exports = router;

