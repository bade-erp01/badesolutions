import { configureStore } from '@reduxjs/toolkit';
import userReducer from './User';
import userReducer2 from './SalesPortalUser';

const store = configureStore({
  reducer: {
    user: userReducer,
    user2:userReducer2
  },
});

export default store;
