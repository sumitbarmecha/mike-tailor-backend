const router = require("express").Router();
const verifyUser = require("../middlewares/verifyToken");
const Product = require("../models/Product");
    
// create product()

router.post("/create", verifyUser, async (req, res) => {
  let product = await Product.findOne({ code: req.body.code });

  if (product) {
    return res
      .status(400)
      .json({ error: "Product with this code already exists" });
  }
  try {
    if (req.user.isAdmin) {
      product = await new Product({
        code: req.body.code,
        category: req.body.category,
        desc: req.body.desc,
        color: req.body.color,
        img: req.body.img,
        price: req.body.price,
      });
      const savedProduct = await product.save();
      res.status(200).json( savedProduct );
    } else {
      res.status(403).json({ error: "invalid request" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

//update product
router.put("/:id", verifyUser, async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404).json({ error: "not found" });
  }
  try {
    if (req.user.isAdmin) { 
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            code: req.body.code,
            category: req.body.category,
            color: req.body.color,
            img: req.body.img,
            price: req.body.price,
          },
        },
        { new: true }
      );
      res.status(200).json(updatedProduct);
    } else {
      res.status(403).json({ error: "invalid request" });
    }
  } catch (error) { 
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
});
//get product ny it's category
router.get("/category", verifyUser, async (req, res) => {
  try {
    const products = await Product.find({ category: req.query.category });
    if (products.length !== 0) {
      res.status(200).json( products );
    } else {
      return res.status(404).json({ error: "not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
});
//get product by it's code
router.get("/code", verifyUser, async (req, res) => {
  try {
    const product = await Product.findOne({ code: req.query.code });
    if (product) {
      return res.status(200).json(product);
    } else {
      return res.status(404).json({ error: "not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }  
});    
  
//get all products 

router.get("/all", verifyUser, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const products = await Product.find();
      if(products.length !== 0){
        res.status(200).json(products);
      }else{
        res.status(404).json({error:"not found"});
      }
    } else {
      res.status(403).json({ error: "invalid request" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
});
// get single product with id
router.get("/single/:id", verifyUser, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: "not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// delete product

router.delete("/:id", verifyUser, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const product = await Product.findById(req.params.id);
      if (product) { 
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product has been deleted" });
      } else {
        res.status(404).json({ error: "not found" });
      }
    }
  } catch (error) { 
    console.error(error.message);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
