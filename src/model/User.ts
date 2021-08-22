import * as mongoose from 'mongoose';

export interface UserDocument  {
   _id?:string;
    firstName:string;
    lastName:string;
    email: string;
    address:string;
    password: string;
    roleName?: string;
    status?:string;
    createdAt: Date;
    updatedAt: Date;
  }
  