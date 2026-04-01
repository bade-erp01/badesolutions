import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import {Encrypt,Dencrypt} from "../Functions/Functions"



// Utility Function: Load Data from Cookies
const loadFromCookies = (key) => {
    try {
        const token = Cookies.get(key);
        if (!token) return null;

        const decoded = Dencrypt(token);
        return decoded.id;
    } catch (e) {
        return null;
    }
};

// Utility Function: Save Data to Cookies
const saveToCookies = (key, value) => {
    try {
        const token = Encrypt(value);
        Cookies.set(key, token, { expires: 3, secure: true, sameSite: 'Strict' });
    } catch (e) { }
};

// Define Redux Slice
const userSlice = createSlice({
    name: "user2",
    initialState: {
        isLoggedIn: false,
        salesPerson: loadFromCookies("salesPerson"),
        SessionId:loadFromCookies("SessionId"),
        error: null,
    },
    reducers: {
        loginSuccess: (_, action) => {
            const newState = {
                isLoggedIn: true,
                salesPerson: action.payload.salesPerson,
                SessionId: action.payload.SessionId,
                error: null,
            };
            saveToCookies("salesPerson", newState.salesPerson);
            saveToCookies("SessionId", action.payload.SessionId);
            return newState;
        },
        loginFailure: (_, action) => {
            Cookies.remove("salesPerson");
            Cookies.remove("SessionId");
            return {
                isLoggedIn: false,
                salesPerson: loadFromCookies("salesPerson"),
                SessionId:loadFromCookies("SessionId"),
                error: action.payload,
            };
        },
        logout: () => {
            Cookies.remove("salesPerson");
            Cookies.remove('SessionId');
            return {
                isLoggedIn: false,
                salesPerson: loadFromCookies("salesPerson"),
                SessionId: loadFromCookies("SessionId"),
                error: null,
            };
        },
    },
});

export const { loginSuccess, loginFailure, logout } = userSlice.actions;
export default userSlice.reducer;
