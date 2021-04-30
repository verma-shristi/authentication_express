const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
mongoose.connect("mongodb+srv://admin:lf@123Shristi@cluster0.ibnzh.mongodb.net/authDB?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
});
var db = mongoose.connection;
if(!db){
    console.log("error");
}
else{
    console.log("connected");
}
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
        required:true,
    },
    tokens:[{
        toekn:{
            type:String
        }
    }]
});
formSchema.methods.generateAuthToken=async function(){
    try{
        const token1=jwt.sign({this:this._id},"heyitisaformdatasecretkeywhichislong");
        this.tokens=this.tokens.concat({token:token1});
        await this.save();
        console.log(token1);
        return token1;
    }
    catch(err){
        console.log(err);
    }
}
formSchema.pre("save",async function(next){
    this.password= await bcrypt.hash(this.password,10);
    this.confirmpass= await bcrypt.hash(this.confirmpass,10);
    next();
})
const users = mongoose.model("form",formSchema);
module.exports=users;
