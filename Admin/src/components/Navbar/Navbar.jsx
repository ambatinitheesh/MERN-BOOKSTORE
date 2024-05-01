import React from 'react'
import './navbar.css'
import navlogo from '../../assets/logo.png'
import navprofile from '../..//assets/nav-profile.svg'
const Navbar = () => {
  return (
    <div className='navbar'>
        <img src={navlogo} alt=" " className='nav-logo'/>
        <p className='nav-admin'>Admin Panel</p>
        <img src={navprofile} alt="" className='nav-profile'/>
    </div>
  )
}
export default Navbar