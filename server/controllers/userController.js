import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";


//Sign up new user

export const signup = async (req, res) =>{
  const {fullName, email, password, bio} = req.body;

  try{
    if(!fullName || !email || !password){
      return res.status(400).json({message: "Please fill all required fields"});
    }
    const user = await User.findOne({email});
    if(user){
      return res.status(400).json({message: "User with this email already exists"});
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });
    
    const token = generateToken(newUser._id);
  } catch(error){

  }
}