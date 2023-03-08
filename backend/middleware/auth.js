const user = require('../models/userModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('./catchAsyncErrors');
const jwt = require('jsonwebtoken');

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {

    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    // console.log(decodedData);
    req.user = await user.findById(decodedData.id);

    // console.log("req.user = "+req.user);

    next();
});


exports.authorizeRoles = (...roles) =>{
    return (req, res, next) =>{

        if(!roles.includes(req.user.role)){
     return next(
        
            new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`, 403),
        )
    };

        next();
    };
};