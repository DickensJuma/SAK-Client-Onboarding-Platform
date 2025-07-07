const mongoose = require("mongoose");
require("dotenv").config();

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const TestModel = mongoose.model("Test", testSchema);

console.log("TestModel:", typeof TestModel);
console.log(
  "TestModel methods:",
  Object.getOwnPropertyNames(TestModel).slice(0, 5)
);

module.exports = TestModel;
