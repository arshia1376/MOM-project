const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const config = require("config");
const doctorSchema = new mongoose.Schema({
    name: String,
    password:String,
    lastName:String,
    phone: String,
    image:String,
    birthday:String,
    address:String,
    email:String,
    phoneDoc:String,
    bio:String,
    description:String,
    Expertise:[String],
    Insurance:String,
    visitOnline:String,
    visitOffline:String,
    cartNumber:String

});
doctorSchema.methods.generateAuthToken = function () {
    const data = {
        _id: this._id,
        name: this.name,
        role: this.role,
    };
    return jwt.sign(data, config.get('jwtPrivateKey'));
};

const doctor = mongoose.model('doctor', doctorSchema);

module.exports = doctor;