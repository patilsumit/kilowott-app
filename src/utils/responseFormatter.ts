import {Response} from 'express';

const sendResponse = (res:Response, status: number,success: boolean, data:any) => {
  res.status(status).send({
    status,
    success,
   ...data,
  });
};

export default sendResponse;
