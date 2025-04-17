const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(()=>{
        console.log("connected to DB");
    })
    .catch((err)=>{
        console.log(err);
    })
async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.get("/",(req, res)=>{
    res.send("Hi, I am root");
});

//Index Route
app.get("/listings", async (req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings } );
});

//New Route
app.get("/listings/new",(req, res)=>{
    res.render("listings/new.ejs")
})

//Show Route
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
})
   
//Create Route
app.post("/listings", async (req, res) => {
    let listingData = req.body.listing;

    // ✅ If user didn’t provide image, set a default image
    if (!listingData.image || !listingData.image.url || listingData.image.url.trim() === "") {
        listingData.image = {
            url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHN1bnNldHxlbnwwfHwwfHx8MA%3D%3D",
            filename: "defaultImage"
        };
    }
    // let {title, description, image, price, country, location} = req.body;////this is the one way to extract data form the things from the body
    const newListing = new Listing(req.body.listing); // req.body.listing => object from form
    await newListing.save();// Save to MongoDB
    res.redirect("/listings");
    // console.log(listing);//all data comes in JS object
    // //listing is in object form
    // //   {
    // //       title: 'My Home',
    // //       description: 'sweet place',
    // //       image: '',
    // //       price: '1200',
    // //       country: 'India',
    // //       location: 'Delhi'
    // //     } //is JS object ko hum apne MongoDb object ya instance mai covert kar sakte hai
})

//Edit Route
app.get("/listings/:id/edit", async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
})

//Update Route
app.put("/listings/:id", async (req, res) =>{
    // let {id} = req.params;
    // await Listing.findByIdAndUpdate(id, {...req.body.listing})//JS object hai jiske ander sare kai saare parameters hai isko deconstruct kar kai un values ko individual values kai ander convert karenge apni new updated value kai ander pass kar denge 
    // res.redirect(`/listings/${id}`);
    const { id } = req.params;
    const { title, price, description, image } = req.body.listing;
  
    const listing = await Listing.findById(id);
  
    listing.title = title;
    listing.price = price;
    listing.description = description;
  
    // Optional: Only update image if provided
    if (image && image.url && image.url.trim() !== "") {
      listing.image.url = image.url;
    }
  
    await listing.save();
    res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id", async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});

// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title:"My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.listen(8080, () =>{
    console.log("server is listening to port 8080");
});