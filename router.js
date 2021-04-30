const express=require("express");
const { Mongoose } = require("mongoose");
const routes=express.Router();
const users=require('./model');
const bcrypt=require("bcryptjs")
routes.get("/",(req,res)=>{
    res.render("index",{title:"Register",heading:"Register"});
});
routes.post("/register",async(req,res)=>{
    var formData = new users({
        email:req.body.email,
        username:req.body.username,
        password:req.body.password,
        confirmpass:req.body.confirmpass
    })
    const token=await formData.generateAuthToken();
    formData.save((err,data)=>{
        if(err) throw err;
        res.render("login",{title:"login",heading:"Login"})
    })
})
routes.get("/login",async(req,res)=>{
    res.render("login",{title:"login",heading:"Login"});
})
routes.post("/login",async(req,res)=>{
    try{
    email=req.body.email
    password=req.body.password
    const useremail=await users.findOne({email:email})
    const isMatch=bcrypt.compare(password,useremail.password);
    const token=await formData.generateAuthToken();
    console.log(token);
    res.cookie("jwt",token)
    console.log(cookie)
    if(isMatch){
        res.render("success");
    }
    else{
        console.log("invaid login details")
    }
    }
    catch(err){
        console.log(err)
    }
})
module.exports=routes;
