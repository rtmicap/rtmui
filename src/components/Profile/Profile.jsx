import { useState, useEffect } from 'react';
import {message} from 'antd';
import DetailCard from '../common/DetailCard.jsx'; 
import { Link, useLocation, useNavigate, useSearchParams  } from 'react-router-dom';
import {firstChrUpperCase} from "../../utils/utils.js";
import { GET_TOOL_BY_ID } from '../../api/apiUrls.js';
import axios from '../../api/axios.js';

function Profile() {
  const handleSubmit=()=>{

  }
  const handleChange=()=>{

  }
  return (
    <div className="">
        <h1>Profile</h1>
        <hr/>
        <h2>Add User</h2>
        <form onSubmit={handleSubmit}>
            <label>
                First Name:
                <input type="text" name="name" onChange={handleChange} required />
            </label>

            <label>
                Last Name:
                <input type="text" name="name" onChange={handleChange} required />
            </label>

            <label>
                Email:
                <input type="text" name="name"  onChange={handleChange} required />
            </label>

            <div><button type="submit" className="primary">Add User</button></div>
            <div><button type="button" className="secondary">Cancel</button></div>
        </form>
    </div>
);
}

export default Profile;
