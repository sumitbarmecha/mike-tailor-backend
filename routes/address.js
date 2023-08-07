const router = require("express").Router();
// const { body, validationResult } = require("express-validator");
const verifyUser = require("../middlewares/verifyToken");
const Address = require("../models/Address");
// const { contry, state, city, street, zipCode, phone } = req.body;

//create address
router.post("/create",verifyUser, async(req,res)=>{
    try {
        const addresses = await Address.find({user:req.user.id});
        if(addresses.length === 2){
          return res.status(403).json({error:"you can have only 2 addresses"})
        }
        const address = new Address({
            country:req.body.country,
            state:req.body.state,
            city:req.body.city,
            street:req.body.street,
            zipCode:req.body.zipCode,
            user:req.user.id
        });
       const savedAddress = await address.save();
        res.status(200).json(savedAddress);
    } catch (error) {
         console.log(error.message);
         res.status(500).json({ error: "internal server error" });
    }
});

//update single address
router.put("/:id",verifyUser, async(req,res)=>{
   const address = await Address.findById(req.params.id);
   if(!address) return res.status(404).json({error:"not found"});
   try {
    if(address.user === req.user.id || req.user.isAdmin){
         const updatedAddress = await Address.findByIdAndUpdate(
           req.params.id,
           {
             $set: {
               country: req.body.country,
               state: req.body.state,
               city: req.body.city,
               street: req.body.street,
               zipCode: req.body.zipCode,
             },
           },
           { new: true }
         );
         res.status(200).json(updatedAddress);
    }else{
        res.status(403).json({error:"invalid request"});
    }
   } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "internal server error" });
   }
});

//get adresses of the logged in user
router.get("/addresses",verifyUser, async (req,res)=>{
   try {
     const addresses = await Address.find({user:req.user.id});
     if(addresses.length === 0) return res.status(404).json({error:"not found"});
     res.status(200).json(addresses);
   } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "internal server error" });
   }
});

//get single address by id
router.get("/single/:id",verifyUser,async (req,res)=>{
    try {
        const address = await Address.findById(req.params.id);
        if(!address) return res.status(404).json({ error: "not found" });
        res.status(200).json(address);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "internal server error" });
    }
});

//get all the addresses in the database ADMIN RESTRICTED ROUTE
router.get("/all",verifyUser,async (req,res)=>{
    try {
        if(req.user.isAdmin){
            const addresses = await Address.find();
            res.status(200).json(addresses);
        }else{
            res.status(403).json({error:"invalid request"});
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "internal server error" });
    }
});

//delete an address
router.delete("/:id",verifyUser, async (req,res)=>{
    const address = await Address.findById(req.params.id);
    if(!address)return res.status(404).json({error:"not found"});
    try {
        if(address.user === req.user.id || req.user.isAdmin){
            await Address.findByIdAndDelete(req.params.id);
            res.status(200).json({message:"address has been deleted successfully"});
        }else{
            res.status(403).json({error:"invalid request"});
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "internal server error" });
    }
});

module.exports = router;
