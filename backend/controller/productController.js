const app = require("../app");
const Products = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");

//Create Product -- Admin -----------------------------------------------------------------------------
exports.createProduct = catchAsyncError(async (req, res, next) => {

    req.body.user = req.user.id;
    console.log(req.body.user);
    const product = await Products.create(req.body);
    // console.log(product);
    res.status(201).json({
        success: true,
        product
    })
});


//Get All Products ------------------------------------------------------------------------------
exports.getAllProducts = catchAsyncError(async (req, res) => {
     
    const resultsPerPage = 6;

    const productsCount = await Products.countDocuments();

    const apiFeature = new ApiFeatures(Products.find(), req.query)
        .search()
        .filter()


    let product = await apiFeature.query;
    
    const filteredProductsCount = product.length;

    apiFeature.pagination(resultsPerPage);
    
    const products = await apiFeature.query.clone();
    
    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultsPerPage,
        filteredProductsCount
    })
});



//Get Product Details--------------------------------------------------------------------------------
exports.getProductDetails = catchAsyncError(async (req, res, next) => {

    let product = await Products.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        product
    })
});

//Update Product -- Admin ------------------------------------------------------------------------------
exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Products.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler(`Id ${req.params.id} Product Not Found`, 404));
    }

    product = await Products.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success: true,
        product
    })
});


//Delete Product -- Admin ------------------------------------------------------------------------------
exports.deleteProduct = catchAsyncError(async (req, res, next) => {

    let product = Products.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    //product = await Products.findByIdAndDelete(req.params.id);
    await product.deleteOne();
    res.status(200).json({
        success: true,
        message: `Product with id ${req.params.id} is deleted successfuly.`
    })
});


//Create New Review or Update the Review
exports.addReview = catchAsyncError(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment: req.body.comment,
    };

    const product = await Products.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user.id
    );

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user.id.toString())
                (rev.rating = rating), (rev.comment = comment);
        });
    } else {
        product.reviews.push(review);
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    })

    avg /= product.reviews.length;
    product.ratings = avg;

    product.numOfReviews = product.reviews.length;

    const updatedone = await product.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
        updatedone
    });
});

// Get all Reviews of a product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
    const product = await Products.findById(req.query.productId);
    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});


exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Products.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }
    const reviews = product.reviews.remove(req.query.id);

    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    })

    avg /= product.reviews.length;
    product.ratings = avg;

    const numOfReviews = product.reviews.length;

    await Products.findByIdAndUpdate(req.query.productId, { reviews, numOfReviews, ratings: avg },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

    res.status(200).json({
        success: true,
        reviews: reviews,
    });
})