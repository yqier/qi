import React, {createContext, useState, useContext, useEffect} from 'react';
import {useUser} from '../context/UserContext';
import Toast from 'react-native-toast-message';

// 创建一个购物车上下文
const CartContext = createContext();

// 创建一个提供 CartContext 的组件
export const CartProvider = ({children}) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useUser();
  console.log('Current User:', user);

  // 从本地存储或服务器加载购物车数据
  const loadCartItems = async () => {
    setLoading(true);
    try {
      if (!user || !user.token) {
        console.error('User is not authenticated.');
        setCartItems([]); // 清空购物车
        return;
      }

      const response = await fetch(
        `http://10.0.2.2:8080/api/cart/fetch?userId=${user.id}`,
        {
          headers: {Authorization: `Bearer ${user.token}`},
        },
      );

      console.log('Fetch response received:', response);
      const data = await response.json();
      console.log('Data parsed from response:', data);

      if (data.success) {
        // 将后端返回的 carts 数据映射为前端所需的格式
        const formattedCartItems = data.carts.map(cart => ({
          foodId: cart.food.id,
          food: cart.food, // 完整的 food 对象
          quantity: cart.quantity, // 商品数量
          cartId: cart.id, // 购物车条目 ID（如果需要用到）
          addedTime: cart.addedTime, // 添加时间（如果需要用到）
        }));

        console.log('Formatted cart items:', formattedCartItems); // 打印格式化后的购物车数据

        setCartItems(formattedCartItems); // 更新购物车状态
      } else {
        console.warn('No cart items returned.');
        setCartItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 添加商品到购物车
  const addToCart = async (food, quantity) => {
    if (!user || !user.token) {
      console.error('User is not authenticated. Token is missing.');
      Alert.alert(
        'Authentication Error',
        'Please log in to add items to cart.',
      );
      return;
    }

    if (!food || !food.id || quantity <= 0) {
      console.error('Invalid input for adding item to cart.');
      Alert.alert('Error', 'Please provide valid food and quantity.');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:8080/api/cart/add', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          foodId: food.id,
          quantity: quantity,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCartItems(prevItems => [
          ...prevItems,
          {
            foodId: food.id,
            food: food,
            quantity: quantity,
            cartId: data.cartId || Date.now(), // 使用后端返回的 ID 或模拟 ID
            addedTime: Date.now(),
          },
        ]);
      } else {
        showError(data.responseMessage);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      showError('Failed to add item to cart. Please try again.');
    }
  };

  // 更新购物车中的商品数量
  const updateQuantity = async (cartId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        removeCartItem(cartId); // 如果数量小于等于 0，直接移除商品
        return;
      }

      // 更新本地购物车状态
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.cartId === cartId ? {...item, quantity: newQuantity} : item,
        ),
      );

      const response = await fetch('http://10.0.2.2:8080/api/cart/update', {
        method: 'PUT',
        headers: {
          Accept: 'application/json', // 添加 Accept 头
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          id: cartId, // 使用后端期望的字段名
          userId: user.id,
          quantity: newQuantity,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        // 仅处理失败情况
        console.error('Failed to update item quantity:', data.responseMessage);
        loadCartItems(); // 如果更新失败，重新加载购物车
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
      loadCartItems(); // 出现错误时，重新加载购物车数据
    }
  };

  // 删除购物车中的商品
  const removeCartItem = async cartId => {
    if (!cartId || !user?.id) {
      console.error('Missing required parameters: cartId or userId');
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:8080/api/cart/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          id: cartId,
          userId: user.id,
        }),
      });

      console.log('Cart ID:', cartId);
      console.log('User ID:', user.id);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.responseMessage || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      if (data.success) {
        setCartItems(prevItems =>
          prevItems.filter(item => item.cartId !== cartId),
        ); // 过滤 cartId
      } else {
        console.error('Failed to remove item from cart:', data.responseMessage);
        Toast.show({
          type: 'error',
          text1: data.responseMessage || 'Failed to remove item from cart',
        });
      }
    } catch (error) {
      console.error('Error removing item from cart:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Error occurred while removing item from cart',
        text2: error.message,
      });
    }
  };

  // 使用 useEffect 组件加载时自动加载购物车数据
  useEffect(() => {
    console.log('User data in CartProvider:', user); // 输出 user 信息进行调试
    loadCartItems();
  }, [user]);

  console.log('loadCartItems function:', loadCartItems);

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
export const useCart = () => {
  return useContext(CartContext);
};
