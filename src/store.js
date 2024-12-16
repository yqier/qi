import {configureStore} from '@reduxjs/toolkit';
import cartReducer from './reducers/cartReducer'; // 使用 cartReducer 来管理购物车状态

const store = configureStore({
  reducer: {
    cart: cartReducer, // 将 cartReducer 作为 cart state
  },
});

export default store;
