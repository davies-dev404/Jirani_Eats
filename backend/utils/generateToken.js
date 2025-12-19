import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  // We prefer sending token in body for this setup, but generic function
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
