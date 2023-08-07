const router = require("express").Router();
const verifyUser = require("../middlewares/verifyToken");
const Subcat = require("../models/Subcat");
    
// create new subcategory     
 
router.post("/create", verifyUser, async (req, res) => {
  try {
    if (req.user.isAdmin) { 
      const subCat = new Subcat({
        category: req.body.category,
        name: req.body.name,
      });
      const savedSubcat = await subCat.save();
      res.status(200).json(savedSubcat);
    } else { 
      res.status(403).json({ error: "invalid request" });
    }   
  } catch (error) {        
    console.log(error.message);  
    res.status(500).json({ error: "internal server error" });
  } 
});
//update subcat 
router.put("/:id", verifyUser, async (req, res) => {
  let subcat = await Subcat.findById(req.params.id);
  if (!subcat) {
    return res.status(404).json({ error: "not found" });
  }
  try {
    if (req.user.isAdmin) {
      const updatedSubcat = await Subcat.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            category: req.body.category,
            name: req.body.name,
          },
        },
        { new: true }
      );
      res.status(200).json( updatedSubcat );
    } else {
      res.status(403).json({ error: "invalid request" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "internal server error" });
  }
});
//get subcategories by their categories
router.get("/category", verifyUser, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const subcats = await Subcat.find({ category: req.query.category });
      if (subcats.length !== 0) {
        res.status(200).json(subcats);
      } else {
        res.status(404).json({ error: "not found" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "internal server error" });
    } 
  }
});     
// het single subcat by it's id
router.get("/single/:id", verifyUser, async (req, res) => {
  let subcat = await Subcat.findOne({ category: req.params.id });
  if (!subcat) {
    return res.status(404).json({ error: "not found" });
  }
  try {
    if (req.user.isAdmin) {
      const subCategory = await Subcat.findById(req.params.id);
      res.status(200).json( subCategory );
    } else {
      res.status(403).json({ error: "invalid request" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "internal server error" });
  }
});

router.get("/all",verifyUser, async(req,res)=>{
  try {
    const subcats = await Subcat.find();
    if(subcats.length === 0) return res.status(404).json({error:"not found"});
    res.status(200).json(subcats);
  } catch (error) {
     console.log(error.message);
     res.status(500).json({ error: "internal server error" }); 
  }
});

// delete a user
router.delete("/:id", verifyUser, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      await Subcat.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "subcategory has been deleted" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "internal server error" });
    }
  } else {
    res.status(403).json({ error: "invalid request" });
  }
});

module.exports = router;
