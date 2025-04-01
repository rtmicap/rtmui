import { useState} from 'react';
import {message} from 'antd';
import { Link, useLocation, useNavigate, useSearchParams  } from 'react-router-dom';
import { ADD_EMPLOYEE } from '../../../api/apiUrls.js';
import axios from '../../../api/axios.js';

function ManageCoordinator() {
  const [addUser,setAddUser]=useState({
    name:"",
    userid:"",
    password:"",
    group:"finance"
  })
  const [isButtonDisabled,setIsButtonDisabled]=useState(false);

  const handleSubmit=async(e)=>{
    e.preventDefault();
    
    if (addUser.name==""){
      message.error("Name cannot be blank");
      return;
    }
    
    if (addUser.userid==""){
      message.error("UserID Name cannot be blank");
      return;
    }
    
    if (addUser.password==""){
      message.error("Passord cannot be blank");
      return;
    }
    
    if (addUser.email==""){
      message.error("Email cannot be blank");
      return;
    }

    try {
                const token = localStorage.getItem("authToken");
                axios.defaults.headers.common["authorization"] = "Bearer " + token;
                const response = await axios.post(ADD_EMPLOYEE, addUser);
                if (response.status === 200 && response.data.result) {
                  message.success("Employee Registered Successfully");
                    setAddUser({
                      name:"",
                      userid:"",
                      password:"",
                      group:"finance"
                    })
                } 
                else {
                    message.error("Error registering an employee");
                }
            } catch (error) {
              if (error.status === 400 && error.response.data.error=="UserId already exists"){
                message.error(error.response.data.error);
              }else{
                message.error("Error registering an employee");
              }
            }
          
  }
  const handleCancel=()=>{
    setAddUser({
        name:"",
        userid:"",
        password:"",
        group:"finance"
      })
    }
  const handleChange=(e)=>{
    
    setAddUser((prev)=>({
      ...prev,[e.target.name]:e.target.value.trim()
    }))
    
  
  }
  return (
    <div className="">
        <h1>Profile</h1>
        <hr/>
        <h2>Add User</h2>
        <form>
            <label>
                Name:
                <input type="text" name="name" onChange={handleChange} value={addUser.firstName} required />
            </label>

            <label>
                UserID:
                <input type="text" name="userid" onChange={handleChange} value={addUser.userid} required />
            </label>
            <label>
                Password:
                <input type="Password" name="password" onChange={handleChange} value={addUser.password} required />
            </label>
            <label>
                Email:
                <input type="email" name="email" required />
            </label>
            <div>
            <button type="button" className="primarybutton" onClick={handleSubmit} disabled={isButtonDisabled}> Add User</button>
            <button type="button" className="secondarybutton" onClick={handleCancel}>Cancel</button>
            </div>
        </form>
    </div>
);
}

export default ManageCoordinator;
