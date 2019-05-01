const express = require("express");
const Router = express.Router();

/*
@route  GET api/profiles
@desc   test get profile route
@access public
*/
Router.get("/", (req, res) => res.send("Profile Api Route"));

module.exports = Router;
