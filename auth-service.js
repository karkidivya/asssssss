const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
dotenv.config();
const Schema = mongoose.Schema;
//make a shopping item schema
const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});
let User; // to be defined on new connection (see initialize)

const URI = process.env.MONGODB_URI;
module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    console.log(URI);
    let db = mongoose.createConnection(URI);
    console.log("Database connected");
    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.register = function (userData) {
  return new Promise(function (resolve, reject) {
    let data = userData;
    User.find({ userName: data.userName })
    .then((user) => {
      if (user.length == 1) {
        reject(`Username already exists`);
      } else if (data.password != data.password2) {
        reject("Passwords do not match");
      } else {
        bcrypt
          .hash(data.password, 10)
          .then((hash) => {
            data.password = hash;
            let newUser = new User(data);
            newUser
              .save()
              .then(() => {
                resolve();
              })
              .catch((err) => {
                if (err.code == 11000) reject("no results returned");
                else err.code != 11000;
                reject(`There was an error creating the user: ${err}`);
              });
            resolve();
          })
          .catch((err) => {
            console.log(err); // Show any errors that occurred during the process
          });
      }
    });
  });
};

module.exports.CheckUser = function (userData) {
  return new Promise(function (resolve, reject) {
    let data = userData;
    User.find({ userName: data.userName })
      .exec()
      .then((user) => {
        if (user.length == 0) {
          reject(`Unable to find user: ${data.userName}`);
        }
        bcrypt.compare(data.password, user[0].password).then((result) => {
          if (result) {
            user[0].loginHistory.push({
              dateTime: new Date().toString(),
              userAgent: data.userAgent,
            });
            User.updateOne(
              { userName: data.userName },
              { $set: { loginHistory: user[0].loginHistory } }
            )
              .exec()
              .then(() => {
                resolve(user);
              })
              .catch((err) => {
                reject(`There was an error verifying the user: ${err}`);
              });
          } else {
            reject(`Incorrect Password for user: ${data.userName}`);
          }
        });
      })
      .catch((err) => {
        reject(`Unable to find user: ${data.userName}`);
      });
  });
};
