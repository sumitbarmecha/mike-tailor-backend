const jwt = require("jsonwebtoken");

const verifyUser = (req, res, next) => {
  // Get the user from the jwt token and add id to req object
  try {
    const authHeader = req.header("authToken");
    if (authHeader) {
      const token = authHeader.split(" ")[1];

      jwt.verify(token, process.env.JWT_SECRETE, (err, user) => {
        if (err) {
          if (err.name === "TokenExpiredError"){
            res.status(400).json({error:{
              message:"expired session"
            }});
          }
            res.status(403).json({ message: "invalid request" });
        }
        req.user = user;
        next();
      });
    } else {
      res.status(401).json({ message: "you are not authenticated" });
    }
  } catch (error) {
    console.log(error);
    res.status(403).json({ message: "invalid request" });
  }
};

// const verifyAdmin = () => {
//   try {
//     const authHeader = req.header("authToken");
//     if (authHeader) {
//       const token = authHeader.split(" ")[1];

//       jwt.verify(token, process.env.JWT_SECRETE, (err, user) => {
//         if (err) {
//           console.log(err);
//           res.status(403).json({ message: "invalid request" });
//         }
//         req.user = user;
//         if (req.user.isAdmin) next();
//       });
//     } else {
//       res.status(401).json({ message: "you are not authenticated" });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(403).json({ message: "invalid request" });
//   }
// };

module.exports = verifyUser;
