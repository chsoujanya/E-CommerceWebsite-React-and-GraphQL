import React from "react";
import { Link } from "react-router-dom";
import './ThankYou.css'
  
const ThankYou = () => {
  return (
    <>
    <nav class="navbar navbar-dark bg-dark navbar-fixed-top">SHOP SPECTRUM
        
          <Link className= "link" style={{marginLeft: "1000px"}} to="/logout">Logout</Link>
        
        
  </nav>
    <h1 className = "ThankYou" >
        Thank You for Shopping!
    </h1>
    </>
  );
};


export default ThankYou;