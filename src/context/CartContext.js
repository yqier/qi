import React, {createContext, useState, useContext, useEffect} from 'react';
import {useUser} from '../context/UserContext';
import Toast from 'react-native-toast-message';
import {Alert} from 'react-native';
import axios from 'axios';
import {BASE_URL} from '../config/BASE_URLS';

// 创建购物车上下文
const CartContext = createContext();

// 全局配置 axios
axios.defaults.baseURL = `${BASE_URL}/api`;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const CartProvider = ({children}) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useUser();

  // 更新 axios 的 Authorization header
  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // 加载购物车数据
  const loadCartItems = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        console.warn('User is not authenticated.');
        setCartItems([]);
        return;
      }

      const response = await axios.get(`/cart/fetch`, {
        params: {userId: user.id},
      });

      if (response.data.success) {
        const formattedCartItems = response.data.carts.map(cart => ({
          foodId: cart.food.id,
          food: cart.food,
          quantity: cart.quantity,
          cartId: cart.id,
          addedTime: cart.addedTime,
        }));
        setCartItems(formattedCartItems);
      } else {
        console.warn('No cart items returned.');
        setCartItems([]);
      }
    } catch (error) {
      handleAxiosError(error, 'Failed to load cart items.');
    } finally {
      setLoading(false);
    }
  };

  // 添加商品到购物车
  const addToCart = async (food, quantity) => {
    if (!user?.id || !user?.token) {
      Alert.alert(
        'Authentication Error',
        'Please log in to add items to cart.',
      );
      return;
    }

    if (!food || !food.id || quantity <= 0) {
      Alert.alert('Error', 'Please provide valid food and quantity.');
      return;
    }

    try {
      const response = await axios.post(`/cart/add`, {
        userId: user.id,
        foodId: food.id,
        quantity,
      });

      if (response.data.success) {
        await loadCartItems();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data.responseMessage || 'Failed to add item to cart.',
        });
      }
    } catch (error) {
      handleAxiosError(error, 'Error adding item to cart.');
    }
  };

  // 更新购物车商品数量
  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      removeCartItem(cartId);
      return;
    }

    try {
      const response = await axios.put(`/cart/update`, {
        id: cartId,
        userId: user.id,
        quantity: newQuantity,
      });

      if (response.data.success) {
        await loadCartItems();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2:
            response.data.responseMessage || 'Failed to update item quantity.',
        });
      }
    } catch (error) {
      handleAxiosError(error, 'Error updating item quantity.');
    }
  };

  // 删除购物车中的商品
  const removeCartItem = async cartId => {
    try {
      const response = await axios.delete(`/cart/delete`, {
        data: {id: cartId, userId: user.id},
      });

      if (response.data.success) {
        setCartItems(prevItems =>
          prevItems.filter(item => item.cartId !== cartId),
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2:
            response.data.responseMessage || 'Failed to remove item from cart.',
        });
      }
    } catch (error) {
      handleAxiosError(error, 'Error removing item from cart.');
    }
  };

  // 处理 axios 错误
  const handleAxiosError = (error, defaultMessage) => {
    if (error.response) {
      console.error('Error Response:', error.response.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response.data?.message || defaultMessage,
      });
    } else if (error.request) {
      console.error('No Response from Server:', error.request);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No response from server.',
      });
    } else {
      console.error('Error:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || defaultMessage,
      });
    }
  };

  // 自动加载购物车数据
  useEffect(() => {
    if (user?.id) {
      loadCartItems();
    } else {
      setCartItems([]);
    }
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeCartItem,
        loading,
        loadCartItems,
      }}>
      {children}
    </CartContext.Provider>
  );
};

// 自定义钩子用来在组件中获取购物车数据
export const useCart = () => useContext(CartContext);
