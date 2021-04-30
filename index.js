const express=require("express");
const app=express();
const bodyParser=require("body-parser");
const routes=require("./router");
const port=process.config.PORT||3000;
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.get("/",routes);
app.post("/register",routes);
app.get("/login",routes);
app.post("/login",routes);
app.listen(port,()=>{
    console.log(`connected to port ${port}`)
})