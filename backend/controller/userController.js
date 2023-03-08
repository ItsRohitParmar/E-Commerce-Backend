const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncErrors");
const User = require('../models/userModel');
const app = require('../app');
const jwtToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const sendToken = require("../utils/jwtToken");

//Register a User ----------------------------------------------------------------------------------------
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, password } = req.body;
    let { email } = req.body;

    email = email.toLowerCase();
    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: "this is a sample id",
            url: "profilepicUrl",
        },
    });
    jwtToken(user, 201, res);
})



//Login a User -----------------------------------------------------------------------------------------
exports.loginUser = catchAsyncError(async (req, res, next) => {

    const { password } = req.body;
    let { email } = req.body;
    email = email.toLowerCase();

    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    jwtToken(user, 200, res);
})



//Logout User -------------------------------------------------------------------------------------------
exports.logout = catchAsyncError(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });



    res.status(200).json({
        success: true,
        message: "Logout Successfully"
    })
})


//Forgot Password -----------------------------------------------------------------------------------------
exports.forgotPassword = catchAsyncError(async (req, res, next) => {

    if(!req.body.email)
    {
        return next(new ErrorHandler("Please Enter Email", 401));
    }
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    //Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it`;

    try {

        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email send to ${user.email} successfully`,
        });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});


// Reset Password

exports.resetPassword = catchAsyncError( async(req, res, next)=>{

    const resetToken = req.params.token;


    const resetPasswordToken = crypto.createHash("sha256")
    .update(resetToken)
    .digest("hex");

    const user = await User.findOne({resetPasswordToken, resetPasswordExpire:{ $gt: Date.now() }});
   
    if(!user)
    {
        return next(new ErrorHandler("Reset Password token has been expired", 401));
    }

    if(req.body.password !== req.body.confirmPassword)
    {
        return next(new ErrorHandler("Password and Confirm Password must be same", 400));
    }

    user.password = req.body.password,
    user.resetPasswordToken = undefined,
    user.resetPasswordExpire = undefined,

    await user.save({validateBeforeSave: false});
    
    sendToken(user, 200, res);
})


// Get User Details (User)
exports.getUserDetails = catchAsyncError( async(req, res, next)=>{
   
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
        success:true,
        user,
    });
});

// Update User Password
exports.updateUserPassword = catchAsyncError( async(req, res, next)=>{
   
    const {oldPassword, newPassword, confirmPassword} = req.body;
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(oldPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid password", 400));
    }
    if(newPassword !== confirmPassword)
    {
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = newPassword;

    await user.save({validateBeforeSave: false});
    
    sendToken(user, 200, res);
});



//Update user Data
exports.updateProfile = catchAsyncError(async (req, res, next) => {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };
  
  
    const user = await User.findByIdAndUpdate(req.user.id, {name: newUserData.name, email:newUserData.email}, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  
    res.status(200).json({
      success: true,
    });
  });

// Admin : Get all users
exports.getAllUser = catchAsyncError( async(req, res, next)=>{
    const users = await User.find();

    res.status(200).json({
        success: true,
        users,
    });
});

// Admin : Get single user
exports.getSingleUser = catchAsyncError( async(req, res, next)=>{
   
    const user = await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHandler(`User not found with Id: ${req.params.id}`));
    }

    res.status(200).json({
        success: true,
        user,
    })
})


//Admin: Update User -name, email and role
exports.updateUserRole = catchAsyncError( async(req, res, next)=>{
    const {name, email, role} = req.body;

    if(!name || !email || !role)
    {
        return next(new ErrorHandler(`Please Enter user's ${!name?"name ":""} ${!email?"email ":""} ${!role?"role ":""} `, 400));
    }
    
    const newUserData = {name, email, role}
    await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });

    res.status(200).json({
        success:true,
        message:"user modified successfully",
    })
})

//Admin: Delete a user
exports.deleteUser = catchAsyncError(async(req, res, next)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler("User does not exist", 404));
    }

    await user.remove();

    res.status(202).json({
        success: true,
        message: "User Deleted Successfully",
    });
});