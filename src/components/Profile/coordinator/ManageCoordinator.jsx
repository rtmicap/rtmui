import { useState} from 'react';
import {message} from 'antd';
import { Link, useLocation, useNavigate, useSearchParams  } from 'react-router-dom';
import { ADD_EMPLOYEE } from '../../../api/apiUrls.js';
import axios from '../../../api/axios.js';
import CheckableTag from 'antd/es/tag/CheckableTag.js';

function ManageCoordinator() {
  const [addUser,setAddUser]=useState({
    name:"",
    userid:"",
    password:"",
    group:['Employee']
  })
  const [isButtonDisabled,setIsButtonDisabled]=useState(false);
  const resetState=()=>{
    setAddUser({
      name:"",
      userid:"",
      password:"",
      group:['Employee']
    })
  }
  const handleSubmit=async(e)=>{
    e.preventDefault();
    try {
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
                const token = localStorage.getItem("authToken");
                axios.defaults.headers.common["authorization"] = "Bearer " + token;
                const response = await axios.post(ADD_EMPLOYEE, addUser);
                console.log('axios ' , addUser)
                if (response.status === 200 && response.data.message) {
                  message.success("Employee Registered Successfully");
                    resetState();
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
      resetState();
    }
  const handleChange=(e)=>{
    setAddUser((prev)=>({
      ...prev,[e.target.name]:e.target.value.trim()
    }))
  }
  const handleCheckboxChange=(e)=>{
    if (e.target.checked){
    setAddUser(prev=>({...prev,
      ['group']:[...addUser.group,e.target.value]
    }))
  }
  else{
    setAddUser(prev=>({...prev,
      ['group']:(addUser.group).filter((grp)=>grp!=e.target.value)
    }))
  }
  console.log(addUser)
  }
  return (
    <div className="">
        <h1>Profile</h1>
        <hr/>
        <h2>Add User</h2>
        <form>
            <label>
                Name:
                <input type="text" name="name" onChange={handleChange} value={addUser.name} required />
            </label>

            <label>
                UserID:
                <input type="text" name="userid" onChange={handleChange} value={addUser.userid} required />
            </label>
            <label>
                Password:
                <input type="Password" name="password" onChange={handleChange} value={addUser.password} required />
            </label>
            {/* <label>
                Email:
                <input type="email" name="email" required />
            </label> */}
            <label>
              Co-ordinator Groups:
              <div className="coordinators-section">
              <div><input type="checkbox" value="order" name="order" onChange={handleCheckboxChange} checked={addUser.group.indexOf("order")>0?true:false}/><label>Orders</label></div>
              <div><input type="checkbox" value="production" name="production" onChange={handleCheckboxChange} checked={addUser.group.indexOf("production")>0?true:false}/><label>Production</label></div>
              <div><input type="checkbox" value="quality" name="quality" onChange={handleCheckboxChange} checked={addUser.group.indexOf("quality")>0?true:false}/><label>Quality</label></div>
              <div><input type="checkbox" value="finance" name="finance" onChange={handleCheckboxChange} checked={addUser.group.indexOf("finance")>0?true:false}/><label>Finance</label></div>
              </div>
            </label>
            <div>
            <button type="submit" className="primarybutton" onClick={handleSubmit} disabled={isButtonDisabled}> Add User</button>
            <button type="button" className="secondarybutton" onClick={handleCancel}>Cancel</button>
            </div>
        </form>
    </div>
);
}

export default ManageCoordinator;