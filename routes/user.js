const router = require("express").Router();
const nodemailer = require("nodemailer");
const randomString = require("randomstring");
const verifyUser = require("../middlewares/verifyToken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");


const sendResetPasswordMail = async(email,otp)=>{
  try {
   const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: false,
      port:587,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass:process.env.PASSWORD
      },
    });
    let info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Alert from MikeTailor",
      html: `<b>${otp}</b><br />This is your otp to reset password for Miketailor`,
    });
    console.log("Message sent: %s", info.messageId);
     console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
     console.log(info.response);
  } catch (error) {
    console.log(error);
  }
}


router.get("/getuser", verifyUser, async (req, res) => {
  try {
    // let userId = req.user.id;
    const user = await User.findById(req.user.id).select("-password" && "-otp");
    if(user){
      res.status(200).json(user);
    }else{
      res.status(404).json({error:"not found"});
    }
  } catch (error) {
    console.error(error.message);

    res.status(500).send("Internal Server Error");
  }
});

// get user by it's phone number -Admin restricted route
router.get("/phone", verifyUser, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const user = await User.findOne({ phone: req.query.phone }).select(
        "-password" && "-otp"
      );
      if (user) {
        res.status(200).json( user );
      } else {
        return res.status(404).json({ error: "not found" });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(403).json({ error: "invalid request" });
  }
});
//get user by id
router.get("/single/:id", verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password" && "-otp");
    if (user) {
      res.status(200).json(user);
    } else {
      return res.status(404).json({ error: "not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
// update the user login required
router.put(
  "/:id",
  [
    body("firstName", "at least 3 characters expected").isLength({ min: 3 }),
    body("lastName", "at least 3 characters expected").isLength({ min: 3 }),
    body("email", "enter a valid email").isEmail(),
    body("phone", "enter a valid mobile number").isMobilePhone(),
  ],
  verifyUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      if (req.user.id === req.params.id || req.user.isAdmin) {
        const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
              phone: req.body.phone,
            },
          },
          { new: true }
        ).select("-password");
        res.status(200).json( updatedUser );
      } else {
        res.status(403).json({ error: "invalid request" });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);
// delete user only admin can do that
router.delete("/:id", verifyUser, async (req, res) => {
  try {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "user has been deleted" });
    }else{
      res.status(403).json({error:"invalid request"});
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
// get all the users
router.get("/all", verifyUser, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const users = await User.find();
      if(users.length === 0) return res.status(404).json({error:"not found"});
      res.status(200).json(users);
    } else {
      res.status(403).json({ error: "invalid request" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/createadmin/:id", verifyUser, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const adminUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            isAdmin: true,
          },
        },
        { new: true }
      ).select("-password" && "-otp");
      res.status(200).json(adminUser);
    } else {
      res.status(403).json({ error: "invalid requested" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//forget password
router.post("/um/forgot-password",async (req,res)=>{
    try {
      const user = await User.findOne({email:req.body.email});
      if(user){ 
        const otp = randomString.generate({
          length: 4, 
          charset: "numeric",
        }); 
        await User.updateOne({email:req.body.email},{$set:{otp:otp}});
        await sendResetPasswordMail(req.body.email,otp);
        res
          .status(200)
          .json({
            message:
              "please check your inbox for otp",
          });
      }else{
        return res.status(404).json({error:"not found"});
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
});
//reset password
router.put("/um/reset-password",async(req,res)=>{
  try {
    const otp = req.body.otp
    const user = await User.findOne(otp);
    if(otp !== ""){
      const salt = await bcrypt.genSalt(10);
      const secPassword = await bcrypt.hash(req.body.password,salt);
       const updatedUser = await User.findByIdAndUpdate(user._id,{$set:{password:secPassword}});
        res.status(200).json({message:"password has been updated successfully"});
    }else{
      res.status(404).json({error:"Please enter valid otp"});
    }
  } catch (error) {
     console.error(error.message);
     res.status(500).send("Internal Server Error");
  } 
});



module.exports = router;
  