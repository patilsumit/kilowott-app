import * as express from 'express';
import { Request, Response } from 'express';
import multer from 'multer';
import onBoardUserController from '../controllers/user.controller';
import sendResponse from '../utils/responseFormatter';
import { isAdmin,isSuperAdmin,isValidate } from '../middleware/auth';

const upload = multer({
  dest: 'temp/profile/',
  limits: { fileSize: 5 * 1024 * 1024 },
});
const onBoardUserRouter = express.Router();

//Create the Employee
onBoardUserRouter.post('/onboard-admin',isSuperAdmin,(req: Request, res: Response) => {
    onBoardUserController
      .adminSignUp(req.body)
      .then((data:any) => {
        sendResponse(res,data.status, true, data);
      })
      .catch((err) => {
        sendResponse(res, err.status, false, err);
      });
  }
);

// //Login API
onBoardUserRouter.post('/user-login',
  (req: Request, res: Response) => {
    onBoardUserController
      .loginUser(req.body)
      .then((data:any) => {
        sendResponse(res,data.status, true, data);
      })
      .catch((err) => {
        sendResponse(res, err.status, false, err);
      });
  }
);

// //Add User API
onBoardUserRouter.post('/add-user',isAdmin,
  (req: Request, res: Response) => {
    onBoardUserController
      .addUser(req.body)
      .then((data:any) => {
        sendResponse(res,data.status, true, data);
      })
      .catch((err) => {
        sendResponse(res, err.status, false, err);
      });
  }
);

// //Update User API
onBoardUserRouter.put('/update-user/:userId',isValidate,upload.single('file'),(req: Request, res: Response) => {  
  onBoardUserController
      .updateUser(req)
      .then((data:any) => {
        sendResponse(res,data.status, true, data);
      })
      .catch((err) => {
        sendResponse(res, err.status, false, err);
      });
  }
);

// //Delete User End point
onBoardUserRouter.delete('/delete-user/:userId',isAdmin,(req: Request, res: Response) => {
    onBoardUserController
      .deleteUser(req.params)
      .then((data:any) => {
        sendResponse(res,data.status, true, data);
      })
      .catch((err) => {
        sendResponse(res, err.status, false, err);
      });
  }
);

// //Enable and Disable User
onBoardUserRouter.put('/update-user-status/:userId',isAdmin,(req: Request, res: Response) => {
  onBoardUserController
    .updateUserStatus(req) 
    .then((data:any) => {
      sendResponse(res,data.status, true, data);
    })
    .catch((err) => {
      sendResponse(res, err.status, false, err);
    });
}
);

// //Change Password
onBoardUserRouter.put('/change-password',isValidate,(req: Request, res: Response) => {
  onBoardUserController
    .changePassowrd(req) 
    .then((data:any) => {
      sendResponse(res,data.status, true, data);
    })
    .catch((err) => {
      sendResponse(res, err.status, false, err);
    });
}
);

// //Get non admin users
onBoardUserRouter.get('/get-users',isValidate,(req: Request, res: Response) => {
  onBoardUserController
    .getAllUserList(req) 
    .then((data:any) => {
      sendResponse(res,data.status, true, data);
    })
    .catch((err) => {
      sendResponse(res, err.status, false, err);
    });
}
);

export default onBoardUserRouter;
