import React, { useState } from "react";
import "./CSS/LoginSignup.css";

const LoginSignup = ({ isModal = false, onLoginSuccess, onSkip }) => {

  const [state,setState] = useState("Login");
  const [formData,setFormData] = useState({username:"",email:"",password:""});
  const [isAgreed, setIsAgreed] = useState(false);

  const changeHandler = (e) => {
    setFormData({...formData,[e.target.name]:e.target.value});
    }

  const login = async () => {
    let dataObj;
    await fetch('https://ecommerce-backend-ldpj.onrender.com/login', {
      method: 'POST',
      headers: {
        Accept:'application/form-data',
        'Content-Type':'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((data) => {dataObj=data});
      console.log(dataObj);
      if (dataObj.success) {
        localStorage.setItem('auth-token',dataObj.token);
        if (isModal && onLoginSuccess) {
          onLoginSuccess(dataObj.token);
        } else {
          window.location.replace("/");
        }
      }
      else
      {
        alert(dataObj.errors)
      }
  }

  const signup = async () => {
    // Check if terms are agreed for signup
    if (!isAgreed) {
      alert("Please agree to the terms of use & privacy policy to continue.");
      return;
    }

    let dataObj;
    await fetch('https://ecommerce-backend-ldpj.onrender.com/signup', {
      method: 'POST',
      headers: {
        Accept:'application/form-data',
        'Content-Type':'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((data) => {dataObj=data});

      if (dataObj.success) {
        localStorage.setItem('auth-token',dataObj.token);
        if (isModal && onLoginSuccess) {
          onLoginSuccess(dataObj.token);
        } else {
          window.location.replace("/");
        }
      }
      else
      {
        alert(dataObj.errors)
      }
  }

  return (
    <div className={`loginsignup ${isModal ? 'modal-content' : ''}`}>
      <div className="loginsignup-container">
        {isModal && (
          <div className="modal-header">
            <h2>Welcome to DRESS CABINET</h2>
            <p>Please login to continue shopping</p>
          </div>
        )}
        
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state==="Sign Up"?<input type="text" placeholder="Your name" name="username" value={formData.username} onChange={changeHandler}/>:<></>}
          <input type="email" placeholder="Email address" name="email" value={formData.email} onChange={changeHandler}/>
          <input type="password" placeholder="Password" name="password" value={formData.password} onChange={changeHandler}/>
        </div>

        <button onClick={()=>{state==="Login"?login():signup()}}>Continue</button>

        {state==="Login"?
        <p className="loginsignup-login">Create an account? <span onClick={()=>{setState("Sign Up")}}>Click here</span></p>
        :<p className="loginsignup-login">Already have an account? <span onClick={()=>{setState("Login")}}>Login here</span></p>}

        {isModal && (
          <div className="modal-actions">
            <button className="skip-btn" onClick={onSkip}>
              Continue as Guest
            </button>
          </div>
        )}

        {/* Only show checkbox for Sign Up */}
        {state==="Sign Up" && (
          <div className="loginsignup-agree">
            <input 
              type="checkbox" 
              name="agree" 
              id="agree" 
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
            <p>By continuing, i agree to the terms of use & privacy policy.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
