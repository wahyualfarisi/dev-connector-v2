const express = require("express");
const Router = express.Router();

//load auth token middleware
const auth = require("./../middleware/auth");

//load models
const User = require("./../models/User");
const Profile = require("./../models/Profile");

//load express-validation
const { check, validationResult } = require("express-validator/check");

/*
@route  GET api/profile/me
@desc   test get profile route
@access private
*/
Router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res.status(404).json({ msg: "There is no profile for this user" });
    }

    res.json({ profile });
  } catch (err) {
    console.log(err);
    res.send("Server Error !");
  }
});

/*
@route  POST api/profile
@desc   create and update profile
@access private
*/
Router.post(
  "/",
  [
    auth,
    check("status", "Status is Required")
      .not()
      .isEmpty(),
    check("skills", "Skill is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    //check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    //build social
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //update profile because profile is exists
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      //if profile is not exist
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

/*
@route  GET api/profile
@desc   get All Profile
@access public
*/
Router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ msg: "Server Error" });
  }
});

/*
@route  GET api/profile/user/:user_id
@desc   get profile by user id
@access public
*/
Router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not found" });
    res.json(profile);
  } catch (error) {
    console.log(error.message);
    if (error.kind === "ObjectId")
      return res.status(400).json({ msg: "Profile Not Found" });
    res.status(500).send("Server Error");
  }
});

/*
@route  DELETE api/profile
@desc   Delele profile , user , and posts
@access private
*/
Router.delete("/", auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "User deleted" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = Router;
