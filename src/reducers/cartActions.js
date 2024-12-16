import axios from 'axios';
import {BASE_URL} from '../config/BASE_URLS';
import {
  setCartItems,
  setLoading,
  removeCartItem,
  updateQuantity,
} from '../reducers/cartReducer';

// 加载购物车数据
export const loadCartItems = userId => async (dispatch, getState) => {
  dispatch(setLoading(true));
  const token = getState().cart.token; // 从 Redux 获取 token

  try {
    const response = await axios.get(`${BASE_URL}/api/cart/fetch`, {
      params: {userId},
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (response.data.success) {
      const formattedCartItems = response.data.carts.map(cart => ({
        foodId: cart.food.id,
        food: cart.food,
        quantity: cart.quantity,
        cartId: cart.id,
        addedTime: cart.addedTime,
      }));
      dispatch(setCartItems(formattedCartItems));
    } else {
      dispatch(setCartItems([]));
    }
  } catch (error) {
    console.error('Error loading cart items:', error);
  } finally {
    dispatch(setLoading(false));
  }
};

// 添加商品到购物车
export const addToCartAsync =
  (userId, food, quantity) => async (dispatch, getState) => {
    if (!food || !food.id || quantity <= 0) {
      alert('Please provide valid food and quantity.');
      return;
    }

    const token = getState().cart.token;

    try {
      const response = await axios.post(
        `${BASE_URL}/api/cart/add`,
        {userId, foodId: food.id, quantity},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        },
      );

      if (response.data.success) {
        dispatch(loadCartItems(userId)); // Reload cart items
      } else {
        console.error('Error adding item to cart:', response.data.message);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

// 更新购物车商品数量
export const updateQuantityAsync =
  (cartId, newQuantity, userId) => async (dispatch, getState) => {
    if (newQuantity <= 0) {
      dispatch(removeCartItemAsync(cartId, userId));
      return;
    }

    const token = getState().cart.token;

    try {
      const response = await axios.put(
        `${BASE_URL}/api/cart/update`,
        {id: cartId, userId, quantity: newQuantity},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        },
      );

      if (response.data.success) {
        dispatch(updateQuantity({cartId, newQuantity}));
      } else {
        console.error('Error updating quantity:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

// 删除购物车商品
export const removeCartItemAsync =
  (cartId, userId) => async (dispatch, getState) => {
    const token = getState().cart.token;

    try {
      const response = await axios.delete(`${BASE_URL}/api/cart/delete`, {
        data: {id: cartId, userId},
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (response.data.success) {
        dispatch(removeCartItem(cartId));
      } else {
        console.error('Error removing item from cart:', response.data.message);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };
