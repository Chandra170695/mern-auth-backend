const mongoose = require('mongoose');
const config = require('config');
//const db = config.get('mongoURI');  // Ensure this matches the key in default.json
const db = "mongodb+srv://perfectmail1995:hmn4S1ozqBqiGakp@testmern.scmqbkb.mongodb.net/";
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
     
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
