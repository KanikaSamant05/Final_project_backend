const express = require("express");
// mergeParams is used when the path is used inside the route folder eg here id is used in review.js; error occurs thus this is used.
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js")
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const ExpressError = require("../utils/expressError.js");
const reviewController = require("../controllers/reviews.js");


// reviews
// post  review route 
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// delete review route
router.delete(
    "/:reviewId", 
    isReviewAuthor,
    isLoggedIn, 
    wrapAsync(reviewController.destroyReview));


module.exports = router;

