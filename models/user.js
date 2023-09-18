const mongoose = require("mongoose");
const { emitter, eventTypes } = require("../lib/emitter");

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  uid: { type: Number, required: true },

  // add other fields for the User model
  firstname: {
    type: String,
    default: "New recruit",
  },
  lastname: {
    type: String,
    default: "",
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  notifications: [String],
  isAdmin: { type: Boolean, default: false },
  leavesAmount: {
    paid_holidays: { type: Number, default: 0 },
    rtt: { type: Number, default: 0 },
  },
});


userSchema.methods.addLogEntry = async function (logEntry, public = false) {
  this.logbook.push({ date: new Date(), entry: logEntry });
  if (public) {
    //publish to discord
  }
  //await this.save();
};

userSchema.statics.findFullUser = async function (id) {
  try {
    const user = await User.findById(id)
      .populate("team")
      .populate({
        path: "team",
        populate: {
          path: "company",
          model: "Company",
        },
      })
      .exec();

    return user;
  } catch (error) {
    throw new Error(error);
  }
};

userSchema.statics.findOrCreate = function (id, profile, callback) {
  const User = this;
  return User.findOne({ id: { $eq: id } })
    .populate("team")
    .exec()
    .then((user) => {
      if (user) {
        if (callback) {
          callback(null, user);
        }
        return user;
      }
      const firstname =
        profile.name.givenName || profile.given_name || "New recruit";
      const lastname = profile.name.familyName || profile.family_name || "";
      
      // Find the maximum existing uid and add 1 for auto-incrementing
      User.findOne()
        .sort('-uid')
        .exec()
        .then((maxUser) => {
          const maxUid = maxUser ? maxUser.uid : 0;
          const newUser = new User({
            id,
            uid: maxUid + 1, // Assigning auto-incrementing value to uid
            firstname: firstname,
            lastname: lastname,
            badges: [],
            completed: [],
            collected: [],
            logbook: [],
            level: 1,
            xp: 0,
            team: null,
            notifications: [],
            isAdmin: false,
          });
          return newUser.save().then((user) => {
            if (callback) {
              emitter.emit(eventTypes.USER_CREATED, user);
              callback(null, user);
            }
            return user;
          });
        });
    })
    .catch((err) => {
      if (callback) {
        callback(err);
      }
      throw err;
    });
};


userSchema.methods.joinTeam = async function (teamId) {
  try {
    // Find the team by its id
    const team = await mongoose.model("Team").findById(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Set the user's team to the found team
    this.team = team._id;
    await this.save();
    emitter.emit(eventTypes.USER_JOINED_TEAM, this);
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
