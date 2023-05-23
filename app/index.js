const express = require("express");
const mongoose = require("mongoose");
const app = express();
const http = require('http').Server(app);
const colors = require('colors');
const schedule = require('node-schedule');
const config=require('config');
const winston = require('winston');
const morgan=require('morgan');
const api =require('./routes/api');
const moment = require('jalali-moment');
moment().locale('fa').format('YYYY/M/D');
const i18n = require('i18n');
const swaggerUi=require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

class Application {

    constructor() {
        this.setupMongoose();
        this.setupExpressServer();
        this.setupConfigs();
        this.setupRoutesAndMiddleware();
        this.setupJalaliMoment();
        // this.setupSwaggerUI();
        this.setupLanguage();
    }

    setupMongoose() {
        mongoose.set('strictQuery', true);
        const run = schedule.scheduleJob('*/9 * * * *', function () {
            console.log('run'.blue);
        });

        mongoose.connect('mongodb://localhost:27017/MOM', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => {
            console.log("db connected".green);
        }).catch(err => {
            console.log("db not connected".red, err);
        })
    }

    setupExpressServer() {
        const port = process.env.myPort || 3423;
        http.listen(port, (err) => {
            if (err) console.log(err);
            else console.log("app listen to port : ".blue.bold + port);
        })
    }

    setupJalaliMoment(){
        const DATE = new Date();
        const date= moment(DATE, 'YYYY-M-D')
            .locale('fa')
            .format('YYYY/M/D');
        console.log("today's date : ".bgYellow + date.bgYellow)
    }

    // setupSwaggerUI(){
    //     const SwaggerOptions = {
    //         definition: {
    //             openapi: '3.0.0',
    //             info: {
    //                 title: 'MOM API',
    //                 version: '1.0.0',
    //                 description: 'A MOM API',
    //             },
    //             servers: [
    //                 {
    //                     url: 'http://localhost:3423',
    //                 },
    //             ],
    //         },
    //         apis: ['./routes/doctorRoutes.js'], // Path to the API docs
    //     };
    //     const swaggerDocs = swaggerJsdoc(SwaggerOptions);
    //     app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    //
    // }

    setupLanguage(){
        app.use(i18n.init);
        i18n.configure({
            directory: __dirname + '/views',
            defaultLocale: 'es',
            queryParameter: 'lang',
            cookie: 'locale'
        });
        app.use((req, res, next) => {
            i18n.init(req, res);
            next();
        });
        app.get('/lan', (req, res) => {
            res.send(i18n.__('greeting'));
        });

    }

    setupRoutesAndMiddleware() {
        app.use(express.json());
        //data teq url
        app.use(express.urlencoded({extended: true}))
        //download img and text and...
        app.use(express.static("uploads"))
        //format log debug
        if (app.get("env") === "development") {
            app.use(morgan("tiny"));
        }


        //routes
        app.use("/api", api)
    }

    setupConfigs(){

        console.log(config.get("databaseAddress").yellow);
        const logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            defaultMeta: { service: 'user-service' },
            transports: [

                // - Write all logs with importance level of `error` or less to `error.log`
                // - Write all logs with importance level of `info` or less to `combined.log`

                new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'combined.log' }),
            ],
        });
        if (process.env.NODE_ENV !== 'production') {
            logger.add(new winston.transports.Console({
                format: winston.format.simple(),
            }));
        }
    }
}

module.exports = Application;