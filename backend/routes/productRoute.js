const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, addReview, getProductReviews, deleteReview } = require("../controller/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
// const Products = require("../models/productModel");

const router = express.Router();

//Route to fetch all products from productController
router.route("/products").get(getAllProducts);

// Route to add new product
router.route("/products/new").post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);

//Route to update, delete & get an existing product
router.route("/products/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct)
    
//Get Single Product Details
router.route("/product/:id").get(getProductDetails);

// Add Update Review
router.route("/review").put(isAuthenticatedUser, addReview);


// Get all reviews and delete revivew -- user
router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser, deleteReview);


module.exports = router;