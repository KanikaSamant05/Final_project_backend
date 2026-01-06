// controllers uses MVC(model,view,controller) which creates framework.
// here callback functions are arranged from listing route to make the route more readable

const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// index route callback func

module.exports.index= async (req , res) =>{
  const { country } = req.query;
  let listings;

  if (country) {
    listings = await Listing.find({
      country: { $regex: new RegExp(country, "i") }
    });
  } else {
    listings = await Listing.find({});
  }
  res.render("listings/index.ejs", {
    listings,
    searchCountry: country || ""
  });
     };

 // category wise
 module.exports.categoryListings = async (req, res) => {
  const { category } = req.params;
  const listings = await Listing.find({ category });

  if (!listings.length) {
    req.flash("error", `No listings found in category: ${category}`);
    return res.redirect("/listings");   // stop here if no data
  }

  res.render("listings/category.ejs", { listings, category });
};  

//  new route
module.exports.RenderNewForm = (req,  res) =>{
        return res.render("listings/new.ejs", {listing: {} });
        };

module.exports.showListing = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
     path: "reviews",
     populate: {
       path: "author",
     },
    })
    
    .populate("owner");
    if(!listing) {
       req.flash("error","Listing you requested for doesn't exists!");
       return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
 };

 module.exports.createListing = async (req, res,next) => {
 let response = await geocodingClient
 .forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
.send();

// Create a new listing from the form data    // Create a new listing from the form data
// Handle uploaded image from Cloudinary (if present)    // Handle uploaded image from Cloudinary (if present)
  let url = req.file.path;
  let filename = req.file.filename;
  // console.log(url, ".." , filename)
    const newListing = new Listing(req.body.listing);
    // assign owner(logged-in user)
    newListing.owner = req.user._id ;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;

    // save the listing
    let savedListing = await newListing.save();
    req.flash("success", "New Listing Created !");
   res.redirect("/listings");
  };


  module.exports.RenderEditForm = async (req , res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
       req.flash("error","Listing you requested for doesn't exists!");
       return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async(req , res, next)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(req.file){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image= {url, filename};
    await listing.save();
    }
  req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`)
};

module.exports.searchListings = async (req, res) => {
  const { place } = req.query;

  // Search by country OR location (case-insensitive)
  const listings = await Listing.find({
    $or: [
      { country: new RegExp(place, "i") },
      { location: new RegExp(place, "i") }
    ]
  });

  // If no listings found, flash a message
  if (listings.length === 0) {
    req.flash("error", "No listings found for this place. Try another location or country.");
    return res.redirect("/listings");
  }

  // Render search results page
  res.render("listings/searchResults", { listings, query: place });
};


module.exports.destroyListing = async (req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};