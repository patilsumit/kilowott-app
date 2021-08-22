const Message = {
    // *****************Console Messages*******************
  
    DB_CONNECTION_SUCCESSFUL: "Connected to MongoDB successfully",
    DB_CONNECTION_FAILED: "MongoBD connection failed ",
  
    USER_SIGNUP_SUCCESS: "User Registered successfully",
    USER_UPDATE_SUCCESS:"User update successfully",
    USER_DELETE_SUCCESS:"User deleted successfully",
    PASSWORD_UPDATE_SUCCESS:"Password update successfully",
    UNABLE_UPDATE_PASSWORD:"Unable to update password",
    UNABLE_DELETE_USER:"Unable to delete user",
    UNABLE_UPDATE_USER:"Unabel to update user",
    USER_DISABLE_SUCCESS:"User disabled successfully",
    AUTH_SUCCESS: "Authentication Successful",
    USER_NOT_FOUND:"User not found!",
    USER_EMAIL_EXIST: "This useremail is already exist",
    USEREMAIL_NOT_FOUND: "Useremail not found",
    PASSWORD_INVALID: "Password is Invalid",
    TOKEN_NOT_FOUND: "Token not found!",
    INVALID_TOKEN: "Invalid token",
    USER_FETCH_SUCCESS: "Users fetch Successfully",
    UNABLE_FETCH_USERS:"Unable to fetch users",
    ACCOUNT_BLOCK:"Your Account block temporary, Please contact administrator",
    TOKEN_MISSING: "Token is missing",
    TOKEN_NOT_ALLOW: `Forbidden - You don't have enough permission to access this resource`,
    TOKEN_EXPIRE: `Either the token is tampered or the session has been expired`,
    
    SOMETHING_WENT_WRONG: "Something went wrong. Please try again.",
  };
  
  export default Message;