doctorModel = require('../../models/Doctor')
const Kavenegar = require('kavenegar');
const apiKey = '74484E79614B7A555A62517A733977437A6763774F554655434D6D685A636D41425A7941395559667A6B6F3D';
const NodeCache = require("node-cache");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const api = Kavenegar.KavenegarApi({apikey: '74484E79614B7A555A62517A733977437A6763774F554655434D6D685A636D41425A7941395559667A6B6F3D'});
const {loginValidator, registerValidator} = require("../validator/doctorValidator");
const myCache = new NodeCache({stdTTL: 2 * 60 * 60, checkperiod: 5 * 60});
const moment = require('moment');


class DoctorController {
    async SendCode(req, res) {
        const id = req.user._id;
        const user = await doctorModel.findById(id);
        if (!user) res.status(404).send('همجین کاریری موحود نیست!')
        const number = Math.floor((Math.random() * 90000) + 10000);
        myCache.set(req.user._id, number);
        api.Send({
                message: `کد ورود شما به لپ:${number}`,
                sender: "10008663",
                receptor: "09384013730",
            },
            function (response, status) {
                res.status(status).send(response)
                console.log(response);
                console.log(status);
            }
        );
    }

    async time(req, res) {
        const {time,timeOne,timeTwo} = req.query;
        const startTime = moment(timeOne, 'HH:mm:ss');
        const endTime = moment(timeTwo, 'HH:mm:ss');
        const num1 = Number(time);
        const totalIntervals = Math.ceil(endTime.diff(startTime, 'minutes') / num1);
        const intervals = [];
        let currentTime = moment(startTime);
        for (let i = 0; i < totalIntervals; i++) {
            intervals.push(currentTime.format('HH:mm:ss'));
            currentTime.add(num1, 'minutes');
        }
        res.send(intervals);
    }

    async VerifyCode(req, res) {
        if (!req.body.code) return res.status(400).send("کدی دریافت نشد");
        const code = req.body.code;
        const lastCode = myCache.get(req.user._id)
        console.log(code, lastCode);
        if (code == lastCode) {
            const user = await doctorModel.findById(req.user._id);
            user.active = true;
            await user.save();
            res.status(200).send(true);
        } else res.status(400).send(false)
    }

    async Login(req, res) {
        const {error} = loginValidator(req.body);
        if (error) {
            return res.status(400).send({message: error.message})
        }
        let user = await doctorModel.findOne({phone: req.body.phone})
        if (!user) return res.status(400).send({message: "کاربری با اتین شماره یا پسوورد ثبت نام نکرده"});
        //equal user password and bcrypt password
        const result = await bcrypt.compare(req.body.password, user.password);
        if (!result) return res.status(400).send({message: "کاربری با اتین شماره یا پسوورد ثبت نام نکرده"});
        const data = {
            _id: user._id,
            name: user.name
        };
        const token = user.generateAuthToken();
        res.header('x-auth-token', token).status(200).send({success: true});
    }

    async Register(req, res) {
        const {error} = registerValidator(req.body);
        if (error) {
            return res.status(400).send({message: error.message})
        }
        let user = await doctorModel.findOne({phone: req.body.phone})
        if (user) return res.status(400).send({message: "این کاربر قبلا ثبت شده"});
        user = new doctorModel(_.pick(req.body, ["name", "phone", "password"]));
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);
        user.password = password;
        user = await user.save();
        const data = {
            _id: user._id,
            name: user.name
        };
        const token = user.generateAuthToken()
        res.header('x-auth-token', token).send(_.pick(user, ["name", "phone", "_id"]))
    }
}

module.exports = new DoctorController();