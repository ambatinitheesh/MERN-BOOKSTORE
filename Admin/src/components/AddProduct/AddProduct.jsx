import React from 'react'
import './addproduct.css'
import upload_area from '../../assets/upload_area.svg'
import { useState } from 'react'
const AddProduct = () => {
    const [image,setImage]=useState(false);
    const [productDetails,setProductDetails]=useState({
        name:"",
        image:"",
        author:"",
        publisher:"",
        language:"",
        old_price:"",
        new_price:"",
        category:"fiction"
        
    })
    const imageHandler=(e)=>{
    setImage(e.target.files[0]);
    }
    const changeHandler=(e)=>{
        setProductDetails({...productDetails,[e.target.name]:e.target.value})
    }
    const Add_Product = async() =>{
        console.log(productDetails);
        let responseData;
        let product = productDetails;
        let formData = new FormData();
        formData.append('product',image);
        await fetch('http://localhost:4000/upload',{
            method:'POST',
            headers:{
                Accept:'application/json',
            },
            body:formData,
        }).then((resp)=>resp.json()).then((data)=>{responseData=data});
        if(responseData.success)
        {
            product.image = responseData.image_url;
            console.log(product);
            await fetch('http://localhost:4000/addproduct',{
                method:'POST',
                headers:{
                    Accept:'application/json',
                    'Content-Type':'application/json',
                },
                body:JSON.stringify(product),
            }).then((resp)=>resp.json()).then((data)=>{
                data.success?alert("Product Added"):alert("Failed")
            })
        }
    }
  return (
    <div className='addproduct'>
        <div className='addproduct-itemfield'>
            <p>Book Name</p>
            <input value={productDetails.name} onChange={changeHandler} type="text"name ="name"placeholder='Type Here'/>
        </div>
        <div className='addproduct-itemfield'>
            <p>Author</p>
            <input value={productDetails.author} onChange={changeHandler} type="text"name ="author"placeholder='Type Here'/>
        </div>
        <div className='addproduct-itemfield'>
            <p>Publisher</p>
            <input value={productDetails.publisher} onChange={changeHandler} type="text"name ="publisher"placeholder='Type Here'/>
        </div>
        <div className='addproduct-itemfield'>
            <p>Language</p>
            <input value={productDetails.language} onChange={changeHandler}type="text"name ="language"placeholder='Type Here'/>
        </div>

        <div className='addproduct-price'>
            <div className='addproduct-itemfield'>
                <p>Price</p>
                <input value={productDetails.old_price}onChange={changeHandler}type="text" name="old_price" placeholder='Type Here'/>
        </div>
        <div className='addproduct-itemfield'>
                <p>Offer Price</p>
                <input value={productDetails.new_price} onChange={changeHandler} type="text" name="new_price" placeholder='Type Here'/>
        </div>
        </div>
        <div className='addproduct-itemfield'>
            <p>Book Category</p>
            <select value={productDetails.category} onChange={changeHandler} name="category" className='add-product-select'>
                <option value="fiction">Fiction</option>
                <option value="nonfic">Non-Fiction</option>
                <option value="kids">Kids</option>
                <option value="novels">Novels</option>
            </select>
        </div>
        <div className='addproduct-itemfield'>
            <label htmlFor='file-input'>
                <img src={image?URL.createObjectURL(image):upload_area} className="addproduct-thumnail-img"alt=""/>
            </label>
            <input onChange={imageHandler} type='file' name="image"id="file-input"hidden/>
        </div>
        <button onClick={()=>{Add_Product()}} className='addproduct-btn'>ADD</button>
    </div>
  )
}

export default AddProduct