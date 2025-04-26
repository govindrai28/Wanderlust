const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");

const validateListing = (req, res, next) => {
    // console.log("Requeset Body: ", req.body);
    let { error } = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

//Index Route
router.get("/", wrapAsync(async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings } );
}));

//New Route
router.get("/new",(req, res)=>{
    res.render("listings/new.ejs")
})

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
}));


//Create Route
router.post("/", validateListing,  wrapAsync(async (req, res, next) => {
    let listingData = req.body.listing;
    // Set default image if none provided
    if (!listingData.image || !listingData.image.url || listingData.image.url.trim() === "") {
        listingData.image = {
            url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHN1bnNldHxlbnwwfHwwfHx8MA%3D%3D",
            filename: "defaultImage"
        }
    }

    const newListing = new Listing(req.body.listing);
    await newListing.save();

    // Optional: flash message
    // req.flash("success", "New listing created successfully!");

    res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update Route
router.put("/:id", validateListing, wrapAsync(async (req, res) =>{
    // let {id} = req.params;
    // await Listing.findByIdAndUpdate(id, {...req.body.listing})//JS object hai jiske ander sare kai saare parameters hai isko deconstruct kar kai un values ko individual values kai ander convert karenge apni new updated value kai ander pass kar denge 
    // res.redirect(`/listings/${id}`);
    const { id } = req.params;
    const { title, price, description, image } = req.body.listing;
  
    const listing = await Listing.findById(id);
  
    listing.title = title;
    listing.price = price;
    listing.description = description;
    if (!image || !image.url || image.url.trim() === "") {
        listing.image = {
            url: listing.image.url || "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&auto=format&fit=crop&q=60"
        };
    } else {
        listing.image = image;
    }
  
    await listing.save();
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;