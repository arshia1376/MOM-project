const router = require("express").Router();
const DoctorRoutes=require('./doctorRoutes')


router.use('/doctor', DoctorRoutes);
module.exports = router;