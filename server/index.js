const port=4000;
const express= require('express');
const app=express();
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const multer=require('multer');
const path=require("path");
const cors=require("cors");


app.use(express.json());

app.use(cors());

//Database connection with mongoose

mongoose.connect("mongodb+srv://2200032344cseh:nitheesh@cluster0.ypqkmbr.mongodb.net/bookstore?retryWrites=true&w=majority&appName=Cluster0")

//API Creation

app.get("/",(req,res)=>{
        res.send("Express App is Running");
})

//Image Storage Engine
 const storage =multer.diskStorage({
    destination:'./upload/images',
    filename:(req,file,cb)=>{
              return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
 })
const upload=multer({storage:storage})

//Creating Upload EndPoint For Images

app.use('/images',express.static('upload/images'))

app.post("/upload",upload.single('product'),(req,res)=>{
res.json({
    success:1,
    image_url:`http://localhost:${port}/images/${req.file.filename}`
})
})
//Schema for Creating Products

const Product=mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    author:{
        type:String,
        required:true,
    },
    publisher :{
        type:String,
        required:true,
    },
    language:{
        type:String,
        required:true,
    },
    image :{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
       type:Boolean,
       default:true,
    },
})

app.post('/addproduct',async(req,res)=>{
    let products=await Product.find({});
    let id;
    if(products.length>0)
    {
        let last_product_array=products.slice(-1);
        let last_product = last_product_array[0];
        id=last_product.id+1;
    }
    else{
        id=1;
    }
   const product =new Product({
    id:id,
    name:req.body.name,
    author:req.body.author,
    publisher:req.body.publisher,
    language:req.body.language,
    image:req.body.image,
    category:req.body.category,
    new_price:req.body.new_price,
    old_price:req.body.old_price,
   });
   console.log(product);
   await product.save();
   console.log("Saved");
   res.json({
    success:true,
    name:req.body.name,
   })
})

//Creating API to delete products
app.post('/removeproduct',async(req,res)=>{
   await Product.findOneAndDelete({id:req.body.id});
   console.log("Removed");
   res.json({
    sucess:true,
    name:req.body.name,
   })
})

//Creating API for getting all products
app.get('/allproducts',async(req,res)=>{
 let products= await Product.find({});
 console.log("All Products Fetched");
 res.send(products);
})

//Creating Schema for User Model

const Users= mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})
//Creating end-point for registering User

app.post('/signup',async(req,res)=>{
    let check=await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"Existing User Found with same email id"})
    }
    let cart={};
    for(let i=0;i<300;i++)
    {
         cart[i]=0;
    }
    const user=new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })
    await user.save();
    
    const data={
        user:{
            id:user.id
        }
    }
      const token= jwt.sign(data,'secret_ecom');
      res.json({success:true,token})
})

//creating end-point for UserLogin
app.post('/login',async(req,res)=>{
    let user= await Users.findOne({email:req.body.email});
    if(user)
    {
        const passCompare = req.body.password === user.password;
          if(passCompare){
            const data={
                user:{
                    id:user.id
                }
            }
            const token= jwt.sign(data,'secret_ecom')
            res.json({success:true,token});
          }
          else{
            res.json({success:false,errors:"Wrong Password"});
          }
    }
    else{
        res.json({success:false,errors:"Email Not Registered or Wrong Email id"})
    }
})

//creating endpoint for newcollection

app.get('/newcollection',async(req,res)=>{
      let products= await Product.find({});
       let newcollection=products.slice(1).slice(-8);
       console.log("New Collection Fetched");
       res.send(newcollection)
})

//creating end-point for in Famous Books
app.get('/famous',async(req,res)=>{
    let products = await Product.find({category:"nonfic"});
    let famous = products.slice(0,4);
    console.log("Famous Books fetched")
    res.send(famous)
})
//creating middleware to fetch user

const fetchUser = async(req,res,next)=>{
     const token =req.header('auth-token');
     if(!token){
        res.status(401).send({errors:"Please Authenticate Using Valid Token"})
     }
     else{
        try{
            const data=jwt.verify(token,'secret_ecom');
            req.user =data.user;
            next();
        }
        catch(error)
        {
              res.status(401).send({errors:"Please authenticate Using Valid Token"})
        }
     }
}

//creating endpoint for adding product in cartdata
app.post('/addtocart',fetchUser,async(req,res)=>{
    console.log("Added",req.body.itemId)
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId]+=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added")
})

//creatinf endpoint to remove product from CartData

app.post('/removefromcart',fetchUser,async(req,res)=>{
    console.log("removed",req.body.itemId)
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0){
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId]-=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed")
    }
})

//creating end point to get cart
app.post('/getcart', fetchuser, async (req, res) => {
    console.log("Get Cart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
  
    })
 
app.listen(port,(error)=>{
if(!error)
{
    console.log("Server Running on Port "+port);
}
else{
    console.log("Error:"+error);
}
})
