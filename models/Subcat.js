const mongoose = require("mongoose");

const subCategorySchema = mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Subcat = mongoose.model("Subcategory", subCategorySchema);

module.exports = Subcat;
