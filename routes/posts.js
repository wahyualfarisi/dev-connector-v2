const express = require("express");
const Router = express.Router();

/*
@route  GET api/profiles
@desc   Test profile route
@access public
*/
Router.get("/", (req, res) => res.send("Posts Api route"));

module.exports = Router;
