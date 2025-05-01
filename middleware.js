module.exports.isLoggedIn = (req, res, next) => {
    console.log("Inside isLoggedIn middleware"); // Add this
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        console.log("User is not authenticated");
        req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/login");
    }
    console.log("User is authenticated");
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

