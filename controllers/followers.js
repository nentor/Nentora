const { Follower, User } = require("../models");

exports.getFollowUser = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({
      where: {
        username: username,
      },
    });

    if (user.username !== req.user.username) {
      const follower = await Follower.findOne({
        where: {
          user_id: user.id,
          follower_id: req.user.id,
        },
      });

      if (!follower) {
        const follower = await Follower.create({
          user_id: user.id,
          follower_id: req.user.id,
        });

        user.follower_count++;
      } else {
        req.flash("warning", "You are already following this user");
        return res.redirect("/profile/" + user.username);
      }

      await user.save();
    } else {
      req.flash("warning", "You cannot follow yourself");
      return res.redirect("/profile/" + req.user.username);
    }

    req.flash("success", "You successfully followed " + username);
    res.redirect("/profile/" + username);
  } catch (err) {
    req.flash("danger", "You cannot follow a user that does not exist");
    res.redirect("/");
  }
};

exports.getUnfollowUser = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({
      where: {
        username,
      },
    });

    if (user.username !== req.user.username) {
      const follower = await Follower.findOne({
        where: {
          user_id: user.id,
          follower_id: req.user.id,
        },
      });

      if (follower) {
        await Follower.destroy({
          where: {
            follower_id: follower.follower_id,
          },
        });
        user.follower_count--;

        await user.save();

        req.flash("success", "You successfully unfollowed this user");
        return res.redirect("/profile/" + user.username);
      } else {
        req.flash(
          "warning",
          "You cannot unfollow a user that you are not following"
        );
        return res.redirect("/profile/" + user.username);
      }
    } else {
      req.flash("warning", "You cannot unfollow yourself");
      return res.redirect("/profile/" + req.user.username);
    }
  } catch (err) {
    req.flash("danger", "You cannot unfollow a user that does not exist");
    res.redirect("/");
  }
};

exports.getIsFollowingUser = async (req, res, next) => {
  const follower = await Follower.findOne({
    where: {
      user_id: req.session.profileUser.id,
      follower_id: req.user.id,
    },
  });

  if (follower) {
    res.locals.isFollowing = true;
  } else {
    res.locals.isFollowing = false;
  }

  next();
};
