const express=require("express");
const app=express();
const port=process.config.PORT||3000;
const mongoose=require("mongoose");
const bodyParser=require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookie=require("cookie-parser")
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookie())
mongoose.connect("mongodb+srv://admin:lf@123Shristi@cluster0.ibnzh.mongodb.net/authDB?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:false
});
var db = mongoose.connection;
if(!db){
    console.log("error");
}
else{
    console.log("connected");
}
const newSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
       
    },
    phone:{
        type:Number,
        required:true 
       
    }
});

const formSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    confirmpass:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});
formSchema.pre("save",async function(next){
    this.password = await bcrypt.hash(this.password,10);
    this.confirmpass = await bcrypt.hash(this.confirmpass,10);
});
formSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id:this._id.toString()},"thisisasecretkeyof32characterslong");
        this.tokens = this.tokens.concat({token});
        await this.save();
        return token;
    }catch(err){
        console.log(err)
    }
}

const users = mongoose.model("new",newSchema);
const authn = mongoose.model("form",formSchema);


app.set("view engine","ejs"); 

const auth = async (req,res,next)=>{
    try {
        const token=req.cookies.jwt;
        const verifyuser = jwt.verify(token,"thisisasecretkeyof32characterslong");
        const user = await authn.findOne({_id:verifyuser._id});
        req.token=token;
        req.user=user;
        

        next();
        
    } catch (error) {
        // res.render("/login",{mess:"login first to access this page"})
        res.send("login first to continue")
        console.log("login first")
    }
}

app.get("/",(req,res)=>{
    res.render("index");
});
app.get("/secret",auth,(req,res)=>{
    res.render("secret")
})
app.post("/register",async(req,res)=>{
    const authData = new authn({
        email:req.body.email,
        username:req.body.username,
        password:req.body.password,
        confirmpass:req.body.confirmpass
    });
    const token = await authData.generateAuthToken();
    res.cookie("jwt",token,{
        expires:new Date(Date.now()+300000),
        httpOnly:true
    });
    authData.save((err,data)=>{
        if(err) throw err;
        res.render("login",{mess:""})
    })
    
})
app.get("/login",(req,res)=>{
    res.render("login",{mess:""})
})
app.post("/login",async(req,res)=>{
   try{
        email  = req.body.email
        password = req.body.password
        const userdata= await authn.findOne({email:email});
        const isMatch = bcrypt.compare(password,userdata.password);
        const token = await userdata.generateAuthToken();
        res.cookie("jwt",token,{
            expires:new Date(Date.now()+300000),
            httpOnly:true
            // secure:true
        });
        console.log(cookie)
        if(isMatch){
            res.render("success");
        }
        else{
            res.status(400).send("invalid login details")
        }
   }catch(err){
       console.log(err);
   }
})
app.get("/logout",auth,async(req,res)=>{
try {
    
    res.clearCookie("jwt");
    console.log("logout successfully")
    await req.user.save();
    res.render("login",{mess:""}) 
} catch (error) {
    console.log("logout error")
}
})
var usersData=users.find({})
app.get("/form",(req,res)=>{
    usersData.exec(function(err,data){
        if(err) throw err;
        res.render("form",{records:data})
    })
    
});
app.post("/form",(req,res)=>{
    var userData=new users({
        name:req.body.name,
        phone:req.body.phone
    }).save((err,record)=>{
        if(err) throw err;
        usersData.exec(function(err,data){
            if(err) throw err;
            res.render("form",{records:data})
        })
        
    })
});
app.get("/delete/:id",(req,res)=>{
    id=req.params.id;
    var del=users.findByIdAndDelete({_id:id},(err,data)=>{
        if (err) throw err;
        del.exec(function(err){
            if (err) throw err;
            res.redirect("/form")
        })
    })
});
app.get("/edit/:id",(req,res)=>{
    id=req.params.id;
    var edit=users.findById({_id:id},(err,data)=>{
        if (err) throw err;
        
        res.render("update",{user:data})
    }) 
});
app.post("/update",(req,res)=>{
    
    var updates=users.findByIdAndUpdate(req.body._id,{
        name:req.body.name,
        phone:req.body.phone 
        
    })
    updates.exec((err)=>{
        if(err) throw err;
        res.redirect("/form");
    })
})

app.listen(port,()=>{
    console.log(port)
})
