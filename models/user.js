const mongoose = require("mongoose");
const { emitter, eventTypes } = require("../lib/emitter");

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },

  // add other fields for the User model
  firstname: {
    type: String,
    default: "New recruit",
  },
  lastname: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    default: "",
  },
});

userSchema.statics.findUserByEmail = async function(email) {
  try {
    const user = await this.findOne({ email: email }).exec();
    return user;
  } catch (error) {
    throw new Error(error);
  }
};

userSchema.statics.findFullUser = async function (id) {
  try {
    const user = await User.findById(id)
      .exec();

    return user;
  } catch (error) {
    throw new Error(error);
  }
};



const User = mongoose.model("User", userSchema);

module.exports = User;
