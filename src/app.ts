import express, { Application, Request, Response } from "express";
import helmet  from "helmet";
import cors from 'cors';
import logger from './logger/index';
import {connect} from './config/db';
import {access} from './config/access';
import Config from './config/dot-env';
import onBoardUserRouter from './routes/user.route';

const NAMESPACE = 'Server';
const app: Application = express();

app.use(helmet()); 
app.use(
  helmet.referrerPolicy({
    policy: "same-origin",
  })
);

app.use(cors());

app.set("trust proxy", true);

app.use(express.json({ limit: '5mb' }));
app.use(
  express.urlencoded({
    extended: false,
  })
);

/** Log the request */
app.use((req, res, next) => {
    /** Log the req */
    logger.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        /** Log the res */
        logger.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    })
    
    next();
});

connect(); //Mongodb Database Connction
access(app) // Rules of API Access

app.use(`/kilowott/${Config.apiURL}/${Config.apiVersion}`,onBoardUserRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to kilowott API Services");
});

app.listen(Config.port, () => logger.info(NAMESPACE,`Server Running in ${Config.port}`));
