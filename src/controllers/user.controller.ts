import { NextFunction, Request, Response } from 'express';

import * as bcrypt from 'bcrypt';
import * as generator from 'generate-password';
import Config from '../config/dot-env';
import User from '../datamodels/User';
import Message from '../constant/message';
import {sign} from '../utils/jwt.utils';
import getPaginationDetails from '../utils/pagination';
import nodemailer from 'nodemailer';
import {UserDocument} from '../model/User';

export default class onBoardUserController {
  //Onboarding the Admin
  static adminSignUp(requestObject:UserDocument) {
    return new Promise((resolve, reject) => {
      try {
        const { firstName, lastName, email, address, password } = requestObject;
        User.findOne({ email: email })
          .then(async (userEmail:UserDocument) => {
            if (userEmail) {
              return resolve({
                // ********* Existing User ********
                status: 409,
                success: false,
                message: Message.USER_EMAIL_EXIST,
              });
            } else {
              const new_user = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                address: address,
                password: bcrypt.hashSync(password, bcrypt.genSaltSync(8)),
              });
              new_user
                .save()
                .then((data: any) => {
                  // ********* User Created *********
                  if (data) {
                    const responseData = {
                      id: data._id,
                      firstName: data.firstName,
                      lastName: data.lastName,
                      email: data.email,
                      address: data.address,
                      status: data.status,
                      isVerified: data.isVerified,
                      roleName: data.roleName,
                    };
                    return resolve({
                      status: 200,
                      data: responseData,
                      success: true,
                      message: `${Message.USER_SIGNUP_SUCCESS}`,
                    });
                  }
                })
                .catch((error) => {
                  return reject({
                    // ********* Rejected while saving to DB *********
                    status: 400,
                    success: false,
                    error: error,
                    message: Message.SOMETHING_WENT_WRONG,
                  });
                });
            }
          })
          .catch((error:any) => {
            return reject({
              // ********* Rejected while findOne *********
              status: 400,
              success: false,
              error: error,
              message: Message.SOMETHING_WENT_WRONG,
            });
          });
      } catch (error) {
        return reject({
          // ********* Error Occured *********
          status: 500,
          success: false,
          message: Message.SOMETHING_WENT_WRONG,
        });
      }
    });
  }

  static loginUser(loginRequest:UserDocument) {
    return new Promise((resolve, reject) => {
      try {
        const { email, password } = loginRequest;
        User.findOne({ email: email })
          .then(async (user:UserDocument) => {
            if (user) {
              if (user.status == 'Disabled') {
                reject({
                  status: 403,
                  success: false,
                  message: Message.ACCOUNT_BLOCK,
                });
              }

              this.comparePassword(password, user.password, (err:any, isMatch:any) => {
                if (isMatch) {
                  sign(user.email, user.roleName).then((token:any) => {
                    const responseData = {
                      id: user._id,
                      firstName: user.firstName,
                      lastName: user.lastName,
                      email: user.email,
                      address: user.address,
                      roleName: user.roleName,
                      authToken: token,
                    };

                    return resolve({
                      status: 200,
                      success: true,
                      data: responseData,
                      message: Message.AUTH_SUCCESS,
                    });
                  });
                } else {
                  return reject({
                    status: 400,
                    success: false,
                    message: Message.PASSWORD_INVALID,
                  });
                }
              });
            } else {
              return reject({
                status: 404,
                success: false,
                message: Message.USEREMAIL_NOT_FOUND,
              });
            }
          })
          .catch((error:any) => {
            return reject({
              status: 404,
              success: false,
              error: error,
              message: Message.USEREMAIL_NOT_FOUND,
            });
          });
      } catch (error) {
        return reject({
          status: 500,
          success: false,
          error: error,
          message: Message.SOMETHING_WENT_WRONG,
        });
      }
    });
  }

  static addUser(requestObject:UserDocument) {
    return new Promise((resolve, reject) => {
      try {
        const { firstName, lastName, email } = requestObject;
        User.findOne({ email: email })
          .then(async (userEmail:UserDocument) => {
            if (userEmail) {
              return resolve({
                // ********* Existing User ********
                status: 409,
                success: false,
                message: Message.USER_EMAIL_EXIST,
              });
            } else {
              //Temporary Passowrd Generater
              const password = generator.generate({
                length: 10,
                numbers: true,
              });
              const new_user = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: bcrypt.hashSync(password, bcrypt.genSaltSync(8)),
                roleName: 'User',
              });
              new_user
                .save()
                .then((data: any) => {
                  if (data) {
                    const transporter = nodemailer.createTransport({
                      service: Config.emailServiceType,
                      auth: {
                        user: Config.fromEmail, // generated ethereal user
                        pass: Config.emailPass, // generated ethereal password
                      },
                      tls: {
                        rejectUnauthorized: false,
                      },
                    });

                    const mailOptions = {
                      from: Config.fromEmail,
                      to: email,
                      subject: 'Kilowott Apps',
                      text: 'Hello Dear',
                      html: `<h1>Your Password is ${password}</h1>`,
                    };
                    transporter.sendMail(mailOptions, (error, info) => {
                      if (error) {
                        reject({ error: error });
                      } else {
                        console.log('Message sent: %s', info.messageId);
                      }
                    });
                    return resolve({
                      status: 200,
                      success: true,
                      message: `${Message.USER_SIGNUP_SUCCESS}`,
                    });
                  }
                })
                .catch((error) => {
                  return reject({
                    status: 400,
                    success: false,
                    error: error,
                    message: Message.SOMETHING_WENT_WRONG,
                  });
                });
            }
          })
          .catch((error:any) => {
            return reject({
              status: 400,
              success: false,
              error: error,
              message: Message.SOMETHING_WENT_WRONG,
            });
          });
      } catch (error) {
        return reject({
          // ********* Error Occured *********
          status: 500,
          success: false,
          message: Message.SOMETHING_WENT_WRONG,
        });
      }
    });
  }

  static updateUser(requestObject:any) {
    return new Promise((resolve, reject) => {
      try {
        const { userId } = requestObject.params;
        const imageFile = requestObject.file;
        const { firstName, lastName, address } = requestObject.body;
        User.findOne({ _id: userId })
          .then(async (userEmail:UserDocument) => {
            if (userEmail) {
              const updateObject = {
                firstName: firstName,
                lastName: lastName,
                address: address,
                profilePic: imageFile ? imageFile.path : '',
              };
              User.updateOne(
                { _id: userId },
                { $set: updateObject },
                { new: true }
              )
                .then((data:UserDocument) => {
                  if (data) {
                    return resolve({
                      status: 200,
                      data: data,
                      success: true,
                      message: Message.USER_UPDATE_SUCCESS,
                    });
                  }
                })
                .catch((error:any) => {
                  return reject({
                    status: 400,
                    success: false,
                    error: error,
                    message: Message.UNABLE_UPDATE_USER,
                  });
                });
            } else {
              return resolve({
                status: 409,
                success: false,
                message: Message.USER_EMAIL_EXIST,
              });
            }
          })
          .catch((error:any) => {
            return reject({
              // ********* Rejected while findOne *********
              status: 400,
              success: false,
              error: error,
              message: Message.SOMETHING_WENT_WRONG,
            });
          });
      } catch (error) {
        return reject({
          // ********* Error Occured *********
          status: 500,
          success: false,
          message: Message.SOMETHING_WENT_WRONG,
        });
      }
    });
  }

  static changePassowrd(requestObject:any) {
    return new Promise((resolve, reject) => {
      try {
        const { newPassword } = requestObject.body;

        const email = requestObject.user.email;

        const updateObject = {
          password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(8)),
        };
        User.updateOne({ email: email }, { $set: updateObject }, { new: true })
          .then((data:UserDocument) => {
            if (data) {
              return resolve({
                status: 200,
                data: data,
                success: true,
                message: Message.PASSWORD_UPDATE_SUCCESS,
              });
            }
          })
          .catch((error:any) => {
            return reject({
              status: 400,
              success: false,
              error: error,
              message: Message.UNABLE_UPDATE_PASSWORD,
            });
          });
      } catch (error) {
        return reject({
          // ********* Error Occured *********
          status: 500,
          success: false,
          message: Message.SOMETHING_WENT_WRONG,
        });
      }
    });
  }

  static deleteUser(requestObject:any) {
    return new Promise((resolve, reject) => {
      try {
        const { userId } = requestObject;
        User.findOne({ _id: userId })
          .then(async (userExists:any) => {
            if (userExists) {
              User.deleteOne({ _id: userId })
                .then((userDeleted:any) => {
                  if (userDeleted) {
                    return resolve({
                      status: 200,
                      success: true,
                      message: Message.USER_DELETE_SUCCESS,
                    });
                  }
                })
                .catch((error:Error) => {
                  return reject({
                    status: 400,
                    success: false,
                    error: error,
                    message: Message.UNABLE_DELETE_USER,
                  });
                });
            } else {
              return reject({
                status: 404,
                success: false,
                message: Message.USER_NOT_FOUND,
              });
            }
          })
          .catch((error:any) => {
            return reject({
              status: 400,
              success: false,
              error: error,
              message: Message.SOMETHING_WENT_WRONG,
            });
          });
      } catch (error) {
        return reject({
          // ********* Error Occured *********
          status: 500,
          success: false,
          message: Message.SOMETHING_WENT_WRONG,
        });
      }
    });
  }

  static updateUserStatus(requestObject:any) {
    return new Promise((resolve, reject) => {
      try {
        const { userId } = requestObject.params;
        const { status } = requestObject.body;
        User.findOne({ _id: userId })
          .then(async (userExists:any) => {
            if (userExists) {
              userExists.status = status;
              userExists.save().then((disableUser:any) => {
                if (disableUser) {
                  return resolve({
                    status: 200,
                    success: true,
                    message: `User ${
                      status == 'Enable' ? 'Enable' : 'Disabled'
                    } Successfully`,
                  });
                }
              });
            } else {
              return reject({
                status: 404,
                success: false,
                message: Message.USER_NOT_FOUND,
              });
            }
          })
          .catch((error:any) => {
            return reject({
              status: 400,
              success: false,
              error: error,
              message: Message.SOMETHING_WENT_WRONG,
            });
          });
      } catch (error) {
        return reject({
          // ********* Error Occured *********
          status: 500,
          success: false,
          message: Message.SOMETHING_WENT_WRONG,
        });
      }
    });
  }

  static getAllUserList(request:any) {
    return new Promise((resolve, reject) => {
      try {
        const { page, size } = request.query;
        const { LIMIT, SKIP } = getPaginationDetails(request);
        User.aggregate([
          {
            $match: { roleName: { $in: ['User'] } },
          },
          {
            $project: {
              __v: 0,
              password: 0,
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $facet: {
              stage1: [
                {
                  $group: {
                    _id: null,
                    count: { $sum: 1 },
                  },
                },
              ],
              stage2: [{ $skip: SKIP }, { $limit: LIMIT }],
            },
          },
          { $unwind: '$stage1' },
          {
            $project: {
              count: '$stage1.count',
              data: '$stage2',
            },
          },
        ])
          .then(async (user) => {
            if (user) {
              let data: any;
              let count: number = 0;
              user.map((response) => {
                (data = response.data), (count = response.count);
              });
              return resolve({
                status: 200,
                success: true,
                facets: {
                  page: parseInt(page) || 1,
                  size: parseInt(size) || 10,
                  count: count,
                },
                data: data,
                message: Message.USER_FETCH_SUCCESS,
              });
            }
          })
          .catch((error) => {
            return reject({
              status: 404,
              success: false,
              message: Message.UNABLE_FETCH_USERS,
            });
          });
      } catch (error) {
        return reject({
          status: 500,
          success: false,
          error: error,
          message: Message.SOMETHING_WENT_WRONG,
        });
      }
    });
  }

  static comparePassword(candidatePass:string, userPass:string, cb:any) {
    bcrypt.compare(candidatePass, userPass, (err, isMatch) => {
      if (err) return cb(err, false);
      cb(null, isMatch);
    });
  }
}