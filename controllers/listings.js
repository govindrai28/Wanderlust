const Listing = require("../models/listing");
module.exports.index = async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings } );
};

module.exports.renderNewForm =  (req, res)=>{
    res.render("listings/new.ejs")
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews", populate: { path:"author" }})
    .populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
       return  res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let listingData = req.body.listing;
    // Set default image if none provided
    if (!listingData.image || !listingData.image.url || listingData.image.url.trim() === "") {
        listingData.image = {
            url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHN1bnNldHxlbnwwfHwwfHx8MA%3D%3D",
            filename: "defaultImage"
        }
    }

    const newListing = new Listing(req.body.listing);
    newListing.image = {url, filename};
    newListing.owner = req.user._id;
    await newListing.save();

    // Optional: flash message
    // req.flash("success", "New listing created successfully!");
    
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
       return  res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) =>{
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
   if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename};
    await listing.save();
   }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}