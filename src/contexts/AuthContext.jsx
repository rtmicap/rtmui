import { createContext, useState, useEffect, useContext } from "react";
import config from "../env.json";
import { useNavigate } from "react-router-dom";
import { currentUser, login } from "../components/Api/apiServices";
import Cookies from "js-cookie";
import axios from "../api/axios";
import { LOGIN_URL, CURRENT_USER_URL } from "../api/apiUrls";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [error, setError] = useState('');
    const [isLoadingUser, setLoadingUser] = useState(true);
    const [isLoading, setLoading] = useState(false);

    const navigate = useNavigate();

    const fetchStart = () => {
        setLoading(true);
        setError('');
    };

    const fetchSuccess = () => {
        setLoading(false);
        setError('');
    };

    const fetchError = (error) => {
        setLoading(false);
        setError(error);
    };

    const userLogin = (user, callbackFun) => {
        // console.log("userLogin: ", user);
        fetchStart();
        axios.post(LOGIN_URL, user).then((loginResponse) => {
            console.log("loginResponse: ", loginResponse);
            const { data } = loginResponse;
            if (data && data.authStatus && data.userData) { // supplier account
                fetchSuccess();
                axios.defaults.headers.common['authorization'] = 'Bearer ' + data.token;
                // Cookies.set('authToken', data.token);
                localStorage.setItem('authToken', data.token);
                getAuthUser();
                if (callbackFun) {
                    callbackFun({ status: 1, admin: false })
                }
            } else if (data && data.authStatus && data.userType == 'admin') { // admin account
                fetchSuccess();
                axios.defaults.headers.common['authorization'] = 'Bearer ' + data.token;
                localStorage.setItem('authToken', data.token);
                getAuthUser();
                if (callbackFun) {
                    callbackFun({ status: 1, admin: true })
                }
            } else {
                fetchSuccess();
                if (callbackFun) {
                    callbackFun({ status: 0, response: loginResponse.response.data })
                }
            }
            console.log("loginResponse data: ", data);
        }).catch((error) => {
            console.log("loginResponse error: ", error);
            fetchError(error.message);
        });
    };

    const userSignOut = (callbackFun) => {
        fetchStart();
        axios.defaults.headers.common['authorization'] = '';
        localStorage.removeItem('authToken');
        setAuthUser(false);
        fetchSuccess();
        if (callbackFun) callbackFun({ status: true, message: "Logout Successfully" });
    };

    const getAuthUser = () => {
        fetchStart();
        axios.post(CURRENT_USER_URL)
            .then(({ data }) => {
                console.log("currentUser: ", data);
                if (data) {
                    fetchSuccess();
                    setAuthUser(data);
                } else {
                    console.log("error curr: ", data.error);
                    fetchError(data.error);
                }
            })
            .catch(function (error) {
                console.log("error curr2: ", error);
                axios.defaults.headers.common['authorization'] = '';
                fetchError(error.message);
            });
    };


    // Subscribe to user on mount
    // component that utilizes this hook to re-render with the latest auth object.
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['authorization'] = 'Bearer ' + token;
        }

        axios.post(CURRENT_USER_URL)
            .then(({ data }) => {
                if (data) {
                    setAuthUser(data);
                }
                setLoadingUser(false);
            })
            .catch(function () {
                localStorage.removeItem('authToken');
                axios.defaults.headers.common['authorization'] = '';
                setLoadingUser(false);
            });
    }, []);


    const value = {
        isLoadingUser,
        isLoading,
        authUser,
        error,
        setError,
        setAuthUser,
        getAuthUser,
        userLogin,
        userSignOut,
    }

    // const auth = useProvideAuth();


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
};
