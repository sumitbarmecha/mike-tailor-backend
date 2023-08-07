const router = require("express").Router();
const randomString = require("randomstring");
const verifyUser = require("../middlewares/verifyToken");
const Order = require("../models/Order");

//create order
router.post("/create", verifyUser, async (req, res) => {

  try {
    const {
      category,
      subCategory,
      product,
      customizations,
      measurements,
      address,
      phone,
    } = req.body;

    const order = new Order({
      category,
      subCategory,
      code: randomString.generate({
        length: 10,
        charset: "numeric",
      }),
      product,
      customizations,
      measurements,
      address,
      phone,
      user: req.user.id,
    });
    const savedOrder = await order.save();
    res.status(200).json( savedOrder );
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "internal server error" });
  }
});

// update/edit order

router.put("/:id", verifyUser, async (req, res) => {
  try {
    const {
      category,
      subCategory,
      product,
      customizations,
      measurements,
      shippingInfo,
      address,
      phone,
    } = req.body;
    const order = await Order.findById(req.params.id);
    if (order.user === req.user.id || req.user.isAdmin) {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            category,
            subCategory,
            product,
            customizations,
            measurements,
            shippingInfo,
            address,
            phone,
          },
        },
        { new: true }
      );
      res.status(200).json(updatedOrder);
    } else {
      res.status(403).json({ error: "invalid request" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "internal server error" });
  }
});

// get oder by id

router.get("/single/:id", verifyUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order.user === req.user.id || req.user.isAdmin) {
      res.status(200).json(order);
    } else {
      res.status(403).json({ error: "invalid request" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "internal server error" });
  }
});
//get order by code
router.get("/code", verifyUser, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const order = await Order.findOne({ code: req.query.code });
      if (order) {
        res.status(200).json( order );
      } else {
        res.status(404).json({ error: "not found" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "internal server error" });
    }
  } else {
    res.status(403).json({ error: "invalid request" });
  }
});


// confirm the order
router.put("/confirm/:id", verifyUser, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order.user === req.user.id) {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            isConfirmed: true,
            toCart: false,
          },
        },
        { new: true }
      );
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "internal server error" });
    }
  }
});

// cancel order

router.put("/cancel/:id", verifyUser, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if(!order) return res.status(404).json({error:"not found"});
  if (req.user.isAdmin) {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            isCancelled: true,
            isConfirmed: false,
          },
        },
        { new: true }
      );
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "internal server error" });
    }
  }
});
//add to cart
router.put("/Acart/:id", verifyUser, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order.user === req.user.id) {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            toCart: true,
          },
        },
        { new: true }
      );
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "internal server error" });
    }
  }
});
//remove from cart
router.put("/Rcart/:id", verifyUser, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order.user === req.user.id) {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            toCart: false,
          },
        },
        { new: true }
      );
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "internal server error" });
    }
  }
});

//add shipping info 
router.put("/addshippinginfo/:id",verifyUser,async (req,res)=>{
  try {
      if(req.use.isAdmin){
         const order = await Order.findById(req.params.id);
         if(order === null) return res.status(404).json({error:"not found"});
         const orderWithShipping = await Order.findByIdAndUpdate(
          req.params.id,
          {$set:{
            shippingInfo:req.body.shippingInfo,
          }},
          {new:true},
         );
         res.status(200).json(orderWithShipping);
      }else{
        res.status(403).json({error:"invalid request"});
      }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "internal server error" });
  }
});

// get all the orders admin restricted route
router.get("/all", verifyUser, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const orders = await Order.find();
      if(orders.length !== 0)
      return res.status(200).json(orders);
    } else {
      res.status(404).json({ error: "not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "internal server error" });
  }
});

// get all orders from the current user

router.get("/user", verifyUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    if (orders.length !== 0) {
      res.status(200).json(orders);
    } else {
      res.status(404).json({ error: "not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "internal server error" });
  }
});


module.exports = router;
