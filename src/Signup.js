import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate , Link} from 'react-router-dom';

import './Signup.css'




const REGISTER_USER = gql`
mutation RegisterUser($username: String!, $email: String!, $password: String!, $user_address: String!) {
  registerUser(username: $username, email: $email, password: $password, user_address: $user_address) {
    username
    email
    password
    user_address
  }
}
`;


const Register = () => {
  const navigate = useNavigate();

  const [registerUser] = useMutation(REGISTER_USER)
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user_address, setAddress] = useState('');


  const handleRegister = async () => {
    try {
      console.log(username, email, password, user_address)
      const result = await registerUser({ variables: { username, email, password, user_address } });
      console.log('Registered user:', result.data.registerUser);
      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      console.error('Registration error:', err.message);
    }
  };


  const style1=
  { 
    width: '100px',    
    height: '40px',    
    fontSize: '16px',  
    padding: '10px',   
    borderRadius: '5px', 
  }

  const styleImg = {
    maxWidth: "100%",
    height: "auto"
  }


  const bottomDivStyle = {
    position: 'fixed',  
    left: 0,
    bottom: 0,
    width: '100%',
    background: 'black',
    padding: '10px',
    textAlign: 'center',
  };

  const centerDivStyle = {
    display: 'flex',
    alignItems: 'center',      
    
  };

  const linkStyle = {
    color: 'blue',
    textDecoration: 'none',  
    transition: 'color 0.3s',  
  };






  return (
    <>
      {/* <div>
      <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
          class="img-fluid" alt="Phone image"   width="500" height="500"></img>
      </div>
    
    <div className = "register">
      <h2>REGISTER YOUR ACCOUNT</h2>
      
      <div>
      <input className = "UsernameInput"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      </div>
      <div>
      <input  className='EmailInput'
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      </div>
      <div>
      <input className='PasswordInput'
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      </div>
      
      <div> 
      <input className='AddressInput'
        type="text"
        placeholder="Address"
        value={user_address}
        onChange={(e) => setAddress(e.target.value)}
      />
      </div>
      <button className= "submitButton" onClick={handleRegister}>Register</button>
      <div>
      <Link to="/login">Already have an account</Link>
      </div>
    </div> */}



<section class="vh-100">
  <div class="container-fluid h-custom" style = {{paddingTop: '50px'}}>
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col-md-9 col-lg-6 col-xl-5">
        <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
          class="img-fluid" alt="Sample image" style = {styleImg}/>
      </div>
      <div class="col-md-8 col-lg-6 col-xl-4 offset-xl-1" style = {centerDivStyle}>
        <form>
          <div class="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
            <p class="lead fw-normal mb-0 me-3" ><h2>REGISTER</h2></p> 
          </div>

          {/* <!-- Email input --> */}
          <div class="form-outline mb-4">
            <input type="email" id="form3Example3" class="form-control form-control-lg"
              placeholder="Enter a Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}/>
            <label class="form-label" for="form3Example3"></label>
          </div>

          <div class="form-outline mb-4">
            <input type="email" id="form3Example3" class="form-control form-control-lg"
              placeholder="Enter a valid email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}/>
            <label class="form-label" for="form3Example3"></label>
          </div>



          {/* <!-- Password input --> */}
          <div class="form-outline mb-3">
            <input type="password" id="form3Example4" class="form-control form-control-lg"
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}/>
            <label class="form-label" for="form3Example4"></label>
          </div>

          <div class="form-outline mb-4">
            <input type="email" id="form3Example3" class="form-control form-control-lg"
              placeholder="Enter address" 
              value={user_address}
              onChange={(e) => setAddress(e.target.value)}/>
            <label class="form-label" for="form3Example3"></label>
          </div>


          <div class="text-center text-lg-start mt-4 pt-2">
            <button type="button" class="btn btn-primary btn-lg"
              style = {style1}  onClick={handleRegister}>REGISTER</button>
            <p class="small fw-bold mt-2 pt-1 mb-0">Already have an account? <a href="#!"
                class="link-danger">
              <Link to="/login" style = {linkStyle}>Login</Link></a></p>
          </div>

        </form>
      </div>
    </div>
  </div>
  <div
    class="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
    
    <div class="text-white mb-3 mb-md-0" style = {bottomDivStyle} >
       All rights reserved.
    </div>
    
    
  </div>
</section>
    </>


  );
};

export default Register;
