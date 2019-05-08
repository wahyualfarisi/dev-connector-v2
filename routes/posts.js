const express = require("express");
const Router = express.Router();
const { check, validationResult } = require("express-validator/check");

//load middleware
const auth = require("../middleware/auth");

//load models
const User = require("./../models/User");
const Post = require("./../models/Post");

/*
@route  POST api/posts
@desc   Add new POST
@access private
*/
Router.post(
  "/",
  [
    auth,
    check("text", "Text is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar
      });
      await newPost.save();
      res.json(newPost);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

/*
@route  GET api/posts
@desc   get all posts
@access private
*/
Router.get("/", auth, async (req, res) => {
  try {
    const post = await Post.find();
    res.json(post);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

/*
@route  GET api/posts/:id
@desc   get post id
@access private
*/
Router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(400).json({ msg: "Post not found" });

    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId")
      return res.status(400).json({ msg: "Post not found" });
    res.status(500).send("Server Error");
  }
});

/*
@route  DELETE api/posts/:id
@desc   delete post id
@access private
*/
Router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(400).json({ msg: "Post not found" });

    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Authorization Failed" });

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId")
      return res.status(400).json({ msg: "Post not found" });
    res.status(500).send("Server Error");
  }
});

/*
@route  LIKE api/posts/like/:id
@desc   like post
@access private
*/

Router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if the post has already been like
    const filterLike = post.likes.filter(
      item => item.user.toString() === req.user.id
    );

    if (filterLike.length > 0)
      return res.status(400).json({ msg: "Post Already like" });

    post.likes.unshift({ user: req.user.id });

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err);
    if (err.kind === "ObjectId")
      return res.status(400).json({ msg: "Something wrong" });
    res.status(500).send("Server Error");
  }
});

/*
@route  UNLIKE api/posts/unlike/:id
@desc   unlike post
@access private
*/

Router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const filterLike = post.likes.filter(
      item => item.user.toString() === req.user.id
    );

    if (filterLike.length === 0)
      return res.status(400).json({ msg: "Post has not yet been liked" });

    const removeIndex = post.likes
      .map(item => item.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

/*
@route  POST api/posts/comment/:id
@desc   post new comment on posts id
@access private
*/
Router.post(
  "/comment/:id",
  [
    auth,
    check("text", "Text is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

/*
@route  DELETE api/posts/comment/:id/:comment_id
@desc   Delete comment
@access private
*/
Router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //pull out comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    //make sure comment exist
    if (!comment) return res.status(404).json({ msg: "Comment is not exist" });

    //check user
    if (comment.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not Authorized" });

    const removeIndex = post.comments
      .map(item => item.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId")
      return res.status(400).json({ msg: "There is no id" });
    res.status(500).send("Server Error");
  }
});

module.exports = Router;
