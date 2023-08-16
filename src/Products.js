import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {  Link, useLocation, useNavigate } from 'react-router-dom';
import {  BsFillCartFill, BsCurrencyRupee,BsFilePerson, BsSearch } from "react-icons/bs";
import Modal from 'react-modal';
import "./Products.css"


const GET_PRODUCTS = gql`
  query {
    products {
      product_id
      product_name
      product_price
      product_description
      image
    }
  }
`;

const ADD_TO_CART = gql`
  mutation addToCart($user_id: Int!, $product_id: Int!, $quantity: Int!) {
    addToCart(user_id: $user_id, product_id: $product_id, quantity: $quantity)
  }
`;


const GET_USER_DETAILS = gql`
  query GetUserDetails($user_id: Int!) {
    getUser(user_id: $user_id) {
      
      username
      email
      password
      user_address
    }
  }
`;


const GET_ORDERS_BY_USER_ID = gql`
  query GetOrdersByUserId($user_id: Int!) {
    getOrdersByUserId(user_id: $user_id) {
      order_id
      order_status
      order_address
      order_total
    }
  }
`;








const Products = () => {
  const { loading, error, data } = useQuery(GET_PRODUCTS);
  const location = useLocation();
  const {user_id, username} = location.state;

  const [addToCart] = useMutation(ADD_TO_CART);
  const [quantity, setQuantity] = useState({});


  const [showPopup, setShowPopup] = useState(false);

  const [showOrderDetails, setShowOrderDetails] = useState(false);


  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);


  const [searchQuery, setSearchQuery] = useState('');


  const [priceSort, setPriceSort] = useState("low-to-high");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");

  const navigate = useNavigate();
  

  const { loading: userLoading, data: userData } = useQuery(GET_USER_DETAILS, {
    variables: { user_id: user_id },
  });


  const { loading: orderLoading, data: orderData } = useQuery(GET_ORDERS_BY_USER_ID, {
    variables: { user_id: user_id },
  });

  


  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleShowDetails = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };


  const handleShowOrderDetails = () => {
    setShowOrderDetails(true);
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
  };



  


  

  const incrementQuantity = (product_id) => {
    setQuantity((prevQuantity) => ({
      ...prevQuantity,
      [product_id]: (prevQuantity[product_id] || 0) + 1,
    }));
  };

  const decrementQuantity = (product_id) => {
    if (quantity[product_id] > 1) {
      setQuantity((prevQuantity) => ({
        ...prevQuantity,
        [product_id]: prevQuantity[product_id] - 1,
      }));
    }
  };

  
  
  const handleAddToCart = async (product_id) => {
    try {

      console.log("userId:", user_id, "productId", product_id, "quantity", quantity[product_id])
      await addToCart({
        variables: { user_id: user_id, product_id, quantity: quantity[product_id] || 1 },
      });
      alert('Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error.message);
    }
  };



  const handleShowProductDetails = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleCloseProductDetails = () => {
    setSelectedProduct(null);
    setShowProductDetails(false);
  };


  const listContainerStyle = {
    display: 'flex',
    justifyContent: 'end', 
    alignItems: 'center',      
    height: '50px',             
    padding: '0 20px',          
    margin: "0",
    top: "0",
    end: "0"
  };

  const listItemStyle = {
    listStyle: 'none',
    margin: '0 10px',           
    fontSize: '16px',           
    color: 'blue',
    top: "0"            
  };


  const sortedProducts = [...data.products];

  if (priceSort === "low-to-high") {
    sortedProducts.sort((a, b) => a.product_price - b.product_price);
  } else if (priceSort === "high-to-low") {
    sortedProducts.sort((a, b) => b.product_price - a.product_price);
  }

  const filteredProducts = sortedProducts.filter(product => {
    if (selectedPriceRange === "all") {
      return true;
    } else if (selectedPriceRange === "low-to-high") {
      return product.product_price <= 100;
    } else if (selectedPriceRange === "high-to-low") {
      return product.product_price > 100;
    }
    return true;
  }).filter(product =>
    searchQuery === '' || product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const navigateToProductsPage = () =>{
    navigate("/products",{state: {user_id}});
  }

  // const refreshPage = ()=>{
  //   window.location.reload();

  // }


    


  return (
    <div>
      <div class = "container-fluid h-custom" style = {{paddingTop: '50px'}}>
      <div class = "container" style = {{display:"flex", justifyContent: "flex-end"}}>
        <label style = {{marginTop: "10px"}}htmlFor="sort-price">Sort by Price:</label>
        <select
          id="sort-price"
          value={priceSort}
          onChange={(e) => setPriceSort(e.target.value)}
        >
          <option value="low-to-high">Low to High</option>
          <option value="high-to-low">High to Low</option>
        </select>
      

      <input 
        type="text"
        placeholder="Search products..."
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)}
      /><BsSearch style = {{marginTop: "10px"}}></BsSearch>
  </div>

     
  <nav class="navbar navbar-dark bg-dark navbar-fixed-top">SHOP SPECTRUM
        <ul className = "ul" >
          <li style = {{fontSize : "medium", cursor: "pointer"}}><span className= "button" onClick={handleShowDetails}>User Details</span></li>
          <li style = {{fontSize : "medium", cursor: "pointer"}}><span className = "button" onClick={handleShowOrderDetails}>Order Details</span></li>
          <li style = {{fontSize : "medium"}}><Link  className= "link" to={`/cart?user_id=${user_id}`} >View Cart</Link></li>
          <li style = {{fontSize : "medium"}}><Link className= "link" to="/logout">Logout</Link></li>
        
        </ul>
  </nav>
      

      <div className="top-right-link">
          
      </div>
      
      
      
      
      <h2 className = "products_name">PRODUCTS</h2>
      
      
      
      
      
      {showPopup && (
        <Modal className = "Modal" isOpen={true} onRequestClose={handleClosePopup}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <h2 style = {{fontWeight: "bold", textDecoration:"underline", fontSize:"50px"}}>USER DETAILS</h2>
          <BsFilePerson style = {{width: "150px", height:"150px", marginRight:"10px"}}></BsFilePerson>
          {userLoading ? (
            <p>Loading...</p>
          ) : (
            <div style={{fontSize:"25px"}}>
              
              <p>Username: {userData.getUser.username}</p>
              <p>Email: {userData.getUser.email}</p>
              <p>Address: {userData.getUser.user_address}</p>
            </div>
          )}
          <button className = "closeButton" onClick={handleClosePopup}>Close</button>
          </div>
        </Modal>
      )}


      {/* {showOrderDetails && (
        <Modal className = "Modal" isOpen={true} onRequestClose={handleCloseOrderDetails}>
          <h2 >Order Details</h2>
          {orderLoading ? (
            <p>Loading...</p>
          ) : (
            <div >
              
              <ul style = {{listStyleType: "none"}}> 
                {orderData.getOrdersByUserId.map((order) => (
                  <div style = {{border:"1px solid",marginRight:"20px", marginBottom: "10px",borderRadius:"10px", backgroundColor:"#edebeb"}}>
                  <li style = {{textDecoration:"none",}}key={order.order_id}>
                    <p style = {{marginLeft:"10px"}}>Order ID: {order.order_id}</p>
                    <p style = {{marginLeft:"10px"}}>Status: {order.order_status}</p>
                    <p style = {{marginLeft:"10px"}}>Address: {order.order_address}</p>
                    <p style = {{marginLeft:"10px"}}>Total: {order.order_total}</p>
                  </li>
                  </div>
                ))}
              </ul>
            </div>
          )}
          <button className = "closeButton" onClick={handleCloseOrderDetails}>Close</button>
        </Modal>
      )} */}
      {showOrderDetails && (
  <Modal className="Modal" isOpen={true} onRequestClose={handleCloseOrderDetails}>
    <h2>Order Details</h2>
    {orderLoading ? (
      <p>Loading...</p>
    ) : (
      <div>
        {orderData.getOrdersByUserId.length === 0 ? ( 
          <>
          <p>No orders yet.</p>
          {/* <button onClick={navigateToProductsPage}>Go Back</button>  */}
          </>
        ) : (
          <ul style={{ listStyleType: "none" }}>
            {orderData.getOrdersByUserId.map((order) => (
              <div
                style={{
                  border: "1px solid",
                  marginRight: "20px",
                  marginBottom: "10px",
                  borderRadius: "10px",
                  backgroundColor: "#edebeb",
                }}
              >
                <li style={{ textDecoration: "none" }} key={order.order_id}>
                  <p style={{ marginLeft: "10px" }}>Order ID: {order.order_id}</p>
                  <p style={{ marginLeft: "10px" }}>Status: {order.order_status}</p>
                  <p style={{ marginLeft: "10px" }}>Address: {order.order_address}</p>
                  <p style={{ marginLeft: "10px" }}>Total: {order.order_total}</p>
                </li>
              </div>
            ))}
          </ul>
        )}
      </div>
    )}
    <button className="closeButton" onClick={handleCloseOrderDetails}>
      Close
    </button>
  </Modal>
)}



      
      




      
      <div className = "products-grid">
       {filteredProducts.map(product => (
        // {data.products.map((product) => ( 
          <div className= "product-card" key={product.product_id}>
            <h4 className = "productName" onClick={() => handleShowProductDetails(product)}>{product.product_name}</h4>
            <div className='imag_container'>
            <img className = "img" 
             src = {require(`./images/`+ product.image +`.jpg`)}
             
            alt={product.product_name} 
             />
            </div>
            <br></br>
            <strong>Price:</strong><BsCurrencyRupee className = "icon"></BsCurrencyRupee>{product.product_price}<br />
            <strong>Description:</strong> {product.product_description}<br />
            
            
            <div className='product-controls'>
            <button onClick={() => decrementQuantity(product.product_id)}>-</button>
            <input
              type="number"
              value={quantity[product.product_id] || 0}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value);
                setQuantity((prevQuantity) => ({
                  ...prevQuantity,
                  [product.product_id]: newQuantity,
                }));
                
              }}
              
            />
            <button onClick={() => incrementQuantity(product.product_id)}>+</button>
            </div>
            
            <br></br>
            <button style = {{}} onClick={() => handleAddToCart(product.product_id)}>Add to Cart</button>
          </div>
        ))}
        
      </div>



      {selectedProduct && showProductDetails && (
        // <Modal className="Modal" isOpen={true} onRequestClose={handleCloseProductDetails}>
        //   <h2 style={{marginTop: "70px"}}>Product Details</h2>
        //   <p style= {{textAlign: "center", marginLeft: "500px", fontWeight:"bold", fontSize: "medium"}}>Product Name: {selectedProduct.product_name}</p>
        //   <img style = {{width: "400px", height: "400px"}}
        //      src = {require(`./images/`+ selectedProduct.image +`.jpg`)}
             
        //     alt={selectedProduct.product_name} />
        //   <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        //     <p style={{ textAlign: 'center', fontSize: 'medium' }}>Price: {selectedProduct.product_price}</p>
        //     <p style={{ textAlign: 'center', fontSize: 'medium' }}>Description: {selectedProduct.product_description}</p>
        //   </div>
        //   <button className = "closeButton" onClick={handleCloseProductDetails}>Close</button>
        // </Modal>
        <Modal className="Modal" isOpen={true} onRequestClose={handleCloseProductDetails}>
        <div style={{ display: 'flex', alignItems: 'center' , marginTop:"80px"}}>
          <div>
            <img style={{ width: '400px', height: '400px', border:"1px solid black" }} src={require(`./images/` + selectedProduct.image + `.jpg`)} alt={selectedProduct.product_name} />
          </div>
          <div style={{ marginLeft: '20px' }}>
            <h2 style={{textDecoration:"underline"}}>Product Details</h2>
            <p style={{ fontWeight: 'bold', fontSize: 'medium' }}>Product Name: {selectedProduct.product_name}</p>
            <p style={{ fontSize: 'medium' }}>Price: {selectedProduct.product_price}</p>
            <p style={{ fontSize: 'medium' }}>Description: {selectedProduct.product_description}</p>
            <button className="closeButton" onClick={handleCloseProductDetails}>Close</button>
          </div>
        </div>
      </Modal>
      )}

      

      {/* <BsFillCartFill></BsFillCartFill> */}
      </div>
    </div>
  );
};

export default Products;