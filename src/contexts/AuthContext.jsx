import { createContext, useState, useEffect, useContext } from "react";
import config from "../env.json";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { currentUser, login } from "../components/Api/apiServices";
import Cookies from "js-cookie";

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
        login(user).then((loginResponse) => {
            console.log("loginResponse: ", loginResponse);
            const { data } = loginResponse;
            if (data.authStatus && data.userData) { // supplier account
                fetchSuccess();
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                // Cookies.set('authToken', data.token);
                localStorage.setItem('userToken', JSON.stringify(data.token));
                getAuthUser();
                if (callbackFun) {
                    callbackFun({ status: 1, admin: false })
                }
            } else if (data.authStatus && data.userType == 'admin') { // admin account
                // fetchSuccess();
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                localStorage.setItem('userToken', data.token);
                getAuthUser();
                if (callbackFun) {
                    callbackFun({ status: 1, admin: true })
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
        axios.defaults.headers.common['Authorization'] = '';
        localStorage.removeItem('userToken');
        setAuthUser(false);
        fetchSuccess();
        if (callbackFun) callbackFun({ status: true, message: "Logout Successfully" });
    };

    const getAuthUser = () => {
        fetchStart();
        currentUser()
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
                axios.defaults.headers.common['Authorization'] = '';
                fetchError(error.message);
            });
    };


    // Subscribe to user on mount
    // component that utilizes this hook to re-render with the latest auth object.
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        }

        currentUser()
            .then(({ data }) => {
                if (data) {
                    setAuthUser(data);
                }
                setLoadingUser(false);
            })
            .catch(function () {
                localStorage.removeItem('userToken');
                axios.defaults.headers.common['Authorization'] = '';
                setLoadingUser(false);
            });
    }, [authUser]);


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
