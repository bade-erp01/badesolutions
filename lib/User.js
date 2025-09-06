import { createSlice } from '@reduxjs/toolkit';
import jwt from 'jsonwebtoken';
import Cookies from 'js-cookie';

// Secret Key for JWT Encryption (ensure this is stored securely)
const SECRET_KEY = "THESTARTUPWAY";

// Utility Function: Load Data from Cookies
const loadFromCookies = (key) => {
    try {
        const token = Cookies.get(key);
        if (!token) return null;

        const decoded = jwt.verify(token, SECRET_KEY);
        // console.log(decoded.data)
        return decoded.data;
    } catch (e) {
        console.error("Failed to load from cookies", e);
        return null;
    }
};

// Utility Function: Save Data to Cookies
const saveToCookies = (key, value) => {
    try {
        const token = jwt.sign({ data: value }, SECRET_KEY, { expiresIn: '3d' });
        Cookies.set(key, token, { expires: 3, secure: true, sameSite: 'Strict' });
    } catch (e) {
        console.error("Failed to save to cookies", e);
    }
};

// Define Redux Slice
const userSlice = createSlice({
    name: "user",
    initialState: {
        isLoggedIn: false,
        userInfo: loadFromCookies("userInfo"),
        businessInfo: loadFromCookies("businessInfo"),
        error: null,
    },
    reducers: {
        loginSuccess: (_, action) => {
            const newState = {
                isLoggedIn: true,
                userInfo: action.payload.user,
                businessInfo: action.payload.business,
                error: null,
            };
            saveToCookies("userInfo", newState.userInfo);
            saveToCookies("businessInfo", newState.businessInfo);
            return newState;
        },
        loginFailure: (_, action) => {
            Cookies.remove("userInfo");
            Cookies.remove("businessInfo");
            return {
                isLoggedIn: false,
                userInfo: loadFromCookies("userInfo"),
                businessInfo: loadFromCookies("businessInfo"),
                error: action.payload,
            };
        },
        logout: () => {
            Cookies.remove("userInfo");
            Cookies.remove("businessInfo");
            return {
                isLoggedIn: false,
                userInfo: loadFromCookies("userInfo"),
                businessInfo: loadFromCookies("businessInfo"),
                error: null,
            };
        },
    },
});

export const { loginSuccess, loginFailure, logout } = userSlice.actions;
export default userSlice.reducer;
