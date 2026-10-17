import { createSlice } from '@reduxjs/toolkit';
import {Dencrypt} from "../Functions/Functions"
import Cookies from 'js-cookie';


// Only what the UI shows before the server answers (user id, company name). Who is
// logged in is decided by the httpOnly session cookie (bade_sid), never by these.
const LEGACY_COOKIES = ["SessionId", "rustyRoof"];
LEGACY_COOKIES.forEach((name) => Cookies.remove(name));

// Utility Function: Load Data from Cookies
const loadFromCookies = (key) => {
    try {
        const raw = Cookies.get(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return Dencrypt(raw); // older cookies
        }
    } catch (e) {
        return null;
    }
};

// Utility Function: Save Data to Cookies
const saveToCookies = (key, value) => {
    try {
        Cookies.set(key, JSON.stringify(value ?? null), { expires: 3, secure: true, sameSite: 'Strict' });
    } catch (e) {}
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
