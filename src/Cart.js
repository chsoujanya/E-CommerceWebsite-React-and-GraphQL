import React, { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useLocation,  } from 'react-router-dom';
import { useNavigate,  } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { BsFillCartFill, BsFillTrashFill} from 'react-icons/bs';
import Modal from 'react-modal';

const GET_CART_ITEMS = gql`
  query getCartItems($user_id: Int!) {
    getCartItems(user_id: $user_id) {
        user_id
        product_id
        quantity
        product {
            product_name
            product_price
      }
    }
  }
`;

const GET_CART_TOTAL = gql`
  query getCartTotal($user_id: Int!) {
    getCartTotal(user_id: $user_id)
  }
`;

const PLACE_ORDER = gql`
  mutation placeOrder(
    $user_id: Int!
    $order_total: Float!
    $order_status: String!
    $order_address: String!
    
  ) {
    placeOrder(
        user_id: $user_id
        order_total: $order_total
        order_status: $order_status
        order_address: $order_address
    ){
        user_id
        order_id
        order_status
        order_address
        order_total
    }
  }
`;

const DELETE_CART_ITEM = gql`
  mutation deleteCartItem($user_id: Int!, $product_id: Int!) {
    deleteCartItem(user_id: $user_id, product_id: $product_id)
  }
`;


const linkStyles = {
  textDecoration: 'none', 
  color: 'white',
  marginLeft: "1000px",

  
  
};

const Cart = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const user_id = parseInt(searchParams.get('user_id'));

  console.log(user_id)



  const navigate = useNavigate();

  const { loading: itemsLoading, error: itemsError, data: itemsData, refetch: refetchCartItems } = useQuery(GET_CART_ITEMS, {
    variables: { user_id },
  });

  const { data: totalData, refetch: refetchCartTotal } = useQuery(GET_CART_TOTAL, {
    variables: { user_id },
  });


  const [placeOrder] = useMutation(PLACE_ORDER);

  

  


  const { loading, error, data } = useQuery(GET_CART_ITEMS, {
    variables: { user_id },
  });

  


  const [orderAddress, setOrderAddress] = useState('');




  const [deleteCartItem] = useMutation(DELETE_CART_ITEM);

  
  

 

  const handleDeleteItem = (product_id) => {
    deleteCartItem({
      variables: {
        user_id: user_id,
        product_id: product_id,
      },
    })
      .then(() => {
        refetchCartItems(); 
        refetchCartTotal();
      })
      .catch((error) => {
        console.error('Error deleting cart item:', error);
      });
  };



  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;


  if (itemsLoading) return <p>Loading...</p>;
  if (itemsError) return <p>Error: {error.message}</p>;

  const navigateToProductsPage = () =>{
    navigate("/products",{state: {user_id}});
  }


  

  let cartTotal = 0;
  
  const cartItems = data.getCartItems;
  if (cartItems.length === 0) {
    return (
      <div>
        
        <nav class="navbar navbar-dark bg-dark navbar-fixed-top">
          SHOP SPECTRUM
          <Link style={linkStyles} to="/logout">
            LOGOUT
          </Link>
        </nav>
        <br />
        <br />
        <h2 style={{ fontWeight: 'bold', textDecoration: 'underline' }}>CART</h2>
        <p>Your cart is empty. Please add items to your cart.</p>
        
        <button onClick={navigateToProductsPage}>Go Back</button> 

      </div>
    );
  }
  else{
    cartTotal = totalData.getCartTotal;
  }
  

  const handlePlaceOrder = () => {


    if (!orderAddress ) {
      alert('Please enter a valid address before placing the order.');
      return;
    }

    if(cartTotal === 0)
    {
      alert("Your cart is empty. Please add items to your cart before placing the order.");
      return;
    }


        placeOrder({
            variables: {
              user_id,
              order_status: 'Placed',
              order_address: orderAddress, 
              order_total: cartTotal,
            },
          }).then(() => {
            alert("Order placed Successfully");
            navigate("/thankyou")
            
          }).catch((error) =>{
              alert(error);
          })
        
    
  };
  


  return (
    
    <div>
      
      
      <nav  class="navbar navbar-dark bg-dark navbar-fixed-top" >
        SHOP SPECTRUM
      
          <Link style={linkStyles} to="/logout">LOGOUT</Link>
      
      </nav>
      <br></br>
      <br></br>
      {/* <h2 style = {{fontWeight:"bold"}}>CART </h2>
      <BsFillCartFill  style = {{marginLeft: "1000px"}}></BsFillCartFill> */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontWeight: 'bold', textDecoration:"underline" }}>CART</h2>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* <BsFillCartFill style={{ fontSize: '20rem' }} /> */}
        </div>
      </div>
        {/* <ul style= {{listStyleType: "none", }} >
        {cartItems.map((cartItem) => (
          <div style= {{marginRight:"10px", marginLeft:"1px", border:"1px solid black", marginBottom: "10px"}}>
          <li key={cartItem.product_id} style= {{}}>
            <strong>{cartItem.product.product_name}</strong>
            <p>Quantity: {cartItem.quantity}</p>
            <p>Price: {cartItem.product.product_price}</p>

            <BsFillTrashFill onClick={() => handleDeleteItem(cartItem.product_id)}>Delete</BsFillTrashFill>
            
          </li>
          
          </div>
        ))}
      </ul> */}
      <ul style={{ listStyleType: 'none' }}>
        
  {cartItems.map((cartItem) => (
    <div >
      <li style = {{marginBottom: "10px"}} key={cartItem.product_id} >
        {/* {console.log("key",cartItem.product_id)} */}
        <div style = {{border:"1px solid",marginRight:"20px", borderRadius:"10px", backgroundColor:"#edebeb"}}>
          <strong style = {{marginLeft:"10px", textDecoration:"underline"}}>{cartItem.product.product_name}</strong>
          <br></br>
          <br></br>
          <p style = {{marginLeft:"10px"}}>Quantity: {cartItem.quantity}</p>
          <p style = {{marginLeft:"10px"}}>Price: {cartItem.product.product_price}</p>
          <button style = {{marginBottom: "10px", marginLeft:"10px", height:"35px",borderRadius:"10px" }} onClick={() => handleDeleteItem(cartItem.product_id)}>Delete</button>
          <BsFillTrashFill style={{ fontSize: '1.5rem' , cursor:"pointer", width:"20px", height:"20px",  marginLeft:"10px", marginTop:"20px"}} onClick={() => handleDeleteItem(cartItem.product_id)} />
        </div>
      </li>
    </div>
  ))}
</ul>
      <p>Total: {cartTotal}</p> 


      <label>
        Order Address:
        <input
          type="text"
          value={orderAddress}
          onChange={(e) => setOrderAddress(e.target.value)}
        />
      </label>


      {/* {console.log("All the cart items are" , cartItems)} */}
      <button onClick={handlePlaceOrder}>Place Order</button>
    </div>
  );
};

export default Cart;