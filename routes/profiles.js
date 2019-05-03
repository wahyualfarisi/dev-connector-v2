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

module.exports = Router;
