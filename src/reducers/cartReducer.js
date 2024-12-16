import {createSlice} from '@reduxjs/toolkit';

// Redux initial state
const initialState = {
  cartItems: [],
  loading: false,
  userId: null,
  token: null,
};

// Redux slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload; // 设置用户 ID
    },
    setToken: (state, action) => {
      state.token = action.payload; // 设置 token
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    addToCart: (state, action) => {
      const {food, quantity} = action.payload;
      const existingItem = state.cartItems.find(
        item => item.foodId === food.id,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        const cartId = food.id + Date.now(); // Generate unique cartId
        state.cartItems.push({foodId: food.id, food, quantity, cartId});
      }
    },
    updateQuantity: (state, action) => {
      const {cartId, newQuantity} = action.payload;
      const item = state.cartItems.find(item => item.cartId === cartId);

      if (item) {
        if (newQuantity <= 0) {
          state.cartItems = state.cartItems.filter(
            item => item.cartId !== cartId,
          );
        } else {
          item.quantity = newQuantity;
        }
      }
    },
    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter(
        item => item.cartId !== action.payload,
      );
    },
  },
});

export const {
  setUserId,
  setToken,
  setCartItems,
  setLoading,
  addToCart,
  updateQuantity,
  removeCartItem,
} = cartSlice.actions;
export default cartSlice.reducer;
