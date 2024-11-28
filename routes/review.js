const express=require("express");
const router=express.Router({mergeParams:true});
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const methodOverride = require("method-override");
const {listingSchema , reviewSchema} = require("../schema.js");
const {validateReview,isLoggedIn,isReviewAuthor}=require("../middleware.js");



router.post('/',isLoggedIn,validateReview, wrapAsync(async (req, res) => {
    // Find the listing by ID from request parameters
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created !");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete Review Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params; // Extract ID and review ID from request parameters
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // Remove review ID from listing's reviews array
    await Review.findByIdAndDelete(reviewId); // Delete the review itself
    req.flash("success","Review Deleted !");
    res.redirect(`/listings/${id}`); // Redirect to the listing details page
})
);
module.exports=router;