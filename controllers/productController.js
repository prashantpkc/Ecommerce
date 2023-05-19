const Product = require("../models/productModel")
const ErrorHandler = require("../utils/errorhandler")
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");
const { query } = require("express");

//Create Product -- Admin
exports.createProduct = catchAsyncError(async (req, res, next) => {

    req.body.user =req.user.id

    req.body.user = req.user.id
    const product = await Product.create(req.body)

    res.status(201).json({ success: true, product });

});

// Get All Product
exports.getAllProducts = catchAsyncError(async (req, res) => {

    const resultPerPage = 5
    const productCount = await Product.countDocuments()
   const apiFeatures = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage)

    const products = await apiFeatures.query

    res.status(200).json({ success: true, products, productCount });
});

//Get Product Details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {

    const product = await Product.findById(req.params.id)
    if (!product) return next(new ErrorHandler("product not found", 404))

    res.status(200).json({ success: true, product });


});

//Update Product -- Admin

exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id)
    if (!product) return next(new ErrorHandler("product not found", 404))
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndmodify: false
    });

    res.status(200).json({
        success: true,
        product
    });
});

// Delete Product

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
    if (!product) return next(new ErrorHandler("product not found", 404))

    await Product.findByIdAndDelete(req.params.id)

    res.status(200).json({
        success: true,
        message: "product deleted successfully"
    });
});

// //Create New Review or update the review

exports.createProductReview = catchAsyncError(async(req, res, next)=> {

    const {rating, comment, productId} = req.body

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }
    const product = await Product.findById(productId)
   
    if(!product ) return next (new ErrorHandler("Product not found"), 404)

    const isReviewed = product.reviews.find(rev=> rev.user.toString()===req.user._id.toString())

    if(isReviewed){
        product.reviews.forEach(rev=> {
            if(rev.user.toString()===req.user._id.toString())
            rev.rating = rating,
            rev.comment = comment

        })

    }else{
        product.reviews.push(review)
        product.numOfReviews =product.reviews.length
    }
    let totalRating = 0
    product.reviews.forEach(rev=>{
        totalRating += rev.rating
    })
    product.ratings = totalRating/product.reviews.length

    await product.save({validateBeforeSave:false,})

    res.status(200).json({
        success:true,
    })
}) 


//Get All Reviews of a product

exports.getProductReviews = catchAsyncError(async(req, res, next)=>{

    const product = await Product.findById(req.query.id)

    if(!product ) return next (new ErrorHandler("Product not found"), 404)

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })

})

//Get All Reviews of a product

exports.deleteReview = catchAsyncError(async(req, res, next)=>{

    const product = await Product.findById(req.query.productId)

    if(!product ) return next (new ErrorHandler("Product not found"), 404)

    const reviews = product.reviews.filter(rev => rev._id.toString()!== req.query.id.toString())

    let totalRating = 0
    reviews.forEach(rev=>{
        totalRating += rev.rating
    })
    const ratings = totalRating/reviews.length

    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {reviews, ratings, numOfReviews}, {new:true,runValidators:true, useFindAndmodify:false })


    res.status(200).json({
        success: true

})
})