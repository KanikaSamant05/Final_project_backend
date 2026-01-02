const express = require("express");
const router = express.Router();
const wrapAsync =require("../utils/wrapAsync.js")
const Listing = require("../models/listing.js")
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
// multer is a package used to upload files or mutilmedia from laptop
const multer = require('multer');
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage});

// Now we are using router.route method which helps in properly arranging the routes who have common paths without requesting for that path repeatedly even though they perform different requests.
// like index and crete route has common path (root"/"")
router.route("/")
// INDEX ROUTE
.get( wrapAsync(listingController.index))
// CREATE ROUTE
.post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
);

 // new route
 router.get("/new", isLoggedIn, listingController.RenderNewForm); 

router.get("/search", wrapAsync(listingController.searchListings));


//  CATEGORY ROUTE
router.get("/category/:category", wrapAsync(async (req, res) => {
  const { category } = req.params;
  const listings = await Listing.find({ category });

  res.render("listings/category.ejs", { listings, category });
}));
 
// here show route, edit route(includes edit and Update- put requests),delete route
router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
       validateListing,
       wrapAsync(listingController.updateListing))

       .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing));


  // edit route
  router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.RenderEditForm));

 module.exports = router;