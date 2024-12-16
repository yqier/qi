import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from './UserContext'; // 引入 UserContext

const OrderContext = createContext();

export const OrderProvider = ({children}) => {
  const [orders, setOrders] = useState([]); // 存储订单数据
  const [loading, setLoading] = useState(true); // 加载状态
  const {user} = useUser(); // 获取当前用户信息

  // 从后端获取订单数据
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken'); // 从存储中获取 JWT token

      if (!user || !jwtToken) {
        console.error('User is not authenticated or JWT token is missing.');
        setOrders([]); // 清空订单数据
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://10.0.2.2:8080/api/order/fetch/user-wise?userId=${user.id}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`, // 使用 JWT token 进行认证
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders); // 设置订单数据
      } else {
        console.error('Failed to fetch orders:', data.message);
        setOrders([]); // 清空订单数据
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]); // 错误情况下清空订单数据
    } finally {
      setLoading(false); // 确保无论成功与否都结束加载状态
    }
  };

  // 手动刷新订单数据
  const refreshOrders = async () => {
    await fetchOrders();
  };

  // 添加新订单（假设用于本地模拟）
  const addOrder = newOrder => {
    setOrders(prevOrders => [...prevOrders, newOrder]);
  };

  // 在组件挂载时自动加载订单数据
  useEffect(() => {
    fetchOrders();
  }, [user]); // 当用户信息变化时重新加载订单数据

  return (
    <OrderContext.Provider value={{orders, loading, refreshOrders, addOrder}}>
      {children}
    </OrderContext.Provider>
  );
};

// 自定义钩子用来在组件中获取订单数据
export const useOrders = () => useContext(OrderContext);
