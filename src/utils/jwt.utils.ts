const jwt = require('jsonwebtoken');

import Config from '../config/dot-env';

export const sign = (email:string,roleName:any)  => {
    return new Promise((resolve, reject) => {
        let secret = Config.JWT_KEY
        let payload = {
            email: email,
            roleName:roleName
        };

        let token = jwt.sign(payload, secret, {
            expiresIn: Config.defaultExpiryTime // JWT expires in 5 hours
        });
        resolve(token)
    })
}

export const decode = (token:string) => {
    return new Promise((resolve, reject) => {
        let secret = Config.JWT_KEY;

        jwt.verify(token, secret, (err:any, decoded:object) => {
            if (err)
                reject('Invalid token');
            else
                resolve(decoded)
        })

    })
}
