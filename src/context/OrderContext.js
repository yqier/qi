import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useUser} from './UserContext'; // 引入 UserContext
import axios from 'axios';
import { BASE_URL } from '../config/BASE_URLS';

const OrderContext = createContext();

export const OrderProvider = ({children}) => {
  const [orders, setOrders] = useState([]); // 存储订单数据
  const [loading, setLoading] = useState(true); // 加载状态
  const {user} = useUser(); // 获取当前用户信息

  // 从后端获取订单数据
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const jwtToken = await AsyncStorage.getItem('jwtToken');

      if (!user || !user.id || !jwtToken) {
        console.error('Missing user or JWT token.', {user, jwtToken});
        setOrders([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/api/order/fetch/user-wise?userId=${user.id}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );

      const data = response.data;

      if (data && data.success) {
        setOrders(data.orders || []);
      } else {
        console.error(
          'Failed to fetch orders:',
          data.message || 'Unknown error',
        );
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error.message);
      setOrders([]);
    } finally {
      setLoading(false);
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
    console.log('Current User:', user);
    fetchOrders();
  }, [user]);

  return (
    <OrderContext.Provider value={{orders, loading, refreshOrders, addOrder}}>
      {children}
    </OrderContext.Provider>
  );
};

// 自定义钩子用来在组件中获取订单数据
export const useOrders = () => useContext(OrderContext);
