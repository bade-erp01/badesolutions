import { createSlice } from '@reduxjs/toolkit';
import {Encrypt,Dencrypt} from "../Functions/Functions"
import Cookies from 'js-cookie';


// Utility Function: Load Data from Cookies
const loadFromCookies = (key) => {
    try {
        const token = Cookies.get(key);
        if (!token) return null;

        const decoded = Dencrypt(token);
        return decoded.data;
    } catch (e) {
        return null;
    }
};

// Utility Function: Save Data to Cookies
const saveToCookies = (key, value) => {
    try {
        const token = Encrypt(value);
        Cookies.set(key, token, { expires: 3, secure: true, sameSite: 'Strict' });
    } catch (e) {}
};

// Define Redux Slice
const userSlice = createSlice({
    name: "user",
    initialState: {
        isLoggedIn: false,
        userInfo: loadFromCookies("userInfo"),
        businessInfo: loadFromCookies("businessInfo"),
        SessionId:loadFromCookies("SessionId"),
        rustyRoof:loadFromCookies("rustyRoof"),
        error: null,
    },
    reducers: {
        loginSuccess: (_, action) => {
            const newState = {
                isLoggedIn: true,
                userInfo: action.payload.user,
                businessInfo: action.payload.business,
                SessionId: action.payload.SessionId,
                rustyRoof: action.payload.rustyRoof,
                error: null,
            };
            saveToCookies("userInfo", newState.userInfo);
            saveToCookies("businessInfo", newState.businessInfo);
            saveToCookies("SessionId", action.payload.SessionId);
            saveToCookies("rustyRoof", action.payload.rustyRoof);
            return newState;
        },
        loginFailure: (_, action) => {
            Cookies.remove("userInfo");
            Cookies.remove("businessInfo");
            Cookies.remove("SessionId");
            Cookies.remove("rustyRoof");
            return {
                isLoggedIn: false,
                userInfo: loadFromCookies("userInfo"),
                businessInfo: loadFromCookies("businessInfo"),
                SessionId:loadFromCookies("SessionId"),
                rustyRoof:loadFromCookies("rustyRoof"),
                error: action.payload,
            };
        },
        logout: () => {
            Cookies.remove("userInfo");
            Cookies.remove("businessInfo");
            Cookies.remove('SessionId');
            Cookies.remove('rustyRoof');
            return {
                isLoggedIn: false,
                userInfo: loadFromCookies("userInfo"),
                businessInfo: loadFromCookies("businessInfo"),
                SessionId: loadFromCookies("SessionId"),
                rustyRoof:loadFromCookies("rustyRoof"),
                error: null,
            };
        },
    },
});

export const { loginSuccess, loginFailure, logout } = userSlice.actions;
export default userSlice.reducer;
