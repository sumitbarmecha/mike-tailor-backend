const router = require("express").Router();
const verifyUser = require("../middlewares/verifyToken");
const Message = require("../models/Message");
 
//create a message  
router.post("/create",verifyUser,async(req,res)=> {
    try { 
        const message = new Message({   
            name:req.body.name,   
            email:req.body.email,
            subject:req.body.subject,
            message:req.body.message, 
        }); 
        const savedMessage = await message.save();
        res.status(200).json(savedMessage);
    } catch (error) {
         console.log(error.message);
         res.status(500).json({ error: "internal server error" });
    }
});

//get message by id

router.get("/single/:id",verifyUser,async(req,res)=>{
    try {
     if (req.user.isAdmin) {
        const message = await Message.findById(req.params.id);
        res.status(200).json(message);
     }else{
        res.status(403).json({error:"invalid request"});
     }    
    } catch (error) {
          console.log(error.message);
          res.status(500).json({ error: "internal server error" });
    }
    
});
// get all the messages in DB
router.get("/all",verifyUser, async (req,res)=>{
    if(req.user.isAdmin){
        try {
            const messages = await Message.find();
            if(messages.length !== 0){
              return res.status(200).json(messages);
            }else{
                res.status(404).json({error:"not found"});
            }
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ error: "internal server error" });
        }
    }else{
        res.status(403).json({ error: "invalid request" });
    }
});

//delete message
router.delete("/:id",verifyUser,async(req,res)=>{
    try {
        if (req.user.isAdmin) {
          await Message.findByIdAndDelete(req.params.id);
          res.status(200).json({message:"Message has been deleted"});
        } else {
          res.status(403).json({ error: "invalid request" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "internal server error" });
    }
});
module.exports = router;