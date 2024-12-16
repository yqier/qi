import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [user, setUser] = useState(null); // 初始用户状态为空
  const [loading, setLoading] = useState(true); // 是否在加载用户数据

  // 从 AsyncStorage 加载用户数据
  const loadUserData = async () => {
    setLoading(true); // 开始加载
    try {
      const storedUser = await AsyncStorage.getItem('user');
      console.log('User data loaded from AsyncStorage:', storedUser);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user data from AsyncStorage:', error);
    } finally {
      setLoading(false); // 结束加载
    }
  };

  useEffect(() => {
    loadUserData(); // 组件挂载时加载用户数据
  }, []);

  // 监听用户状态变化，用于调试或其他依赖
  useEffect(() => {
    console.log('User state updated in Context:', user);
  }, [user]);

  // 登录方法
  const login = async userData => {
    setLoading(true); // 开始加载
    try {
      setUser(userData); // 更新用户状态
      await AsyncStorage.setItem('user', JSON.stringify(userData)); // 保存用户数据到 AsyncStorage
      console.log('User logged in:', userData);
    } catch (error) {
      console.error('Error saving user data to AsyncStorage:', error);
    } finally {
      setLoading(false); // 结束加载
    }
  };

  // 登出方法
  const logout = async () => {
    setLoading(true); // 开始加载
    try {
      setUser(null); // 清空用户状态
      await AsyncStorage.removeItem('user'); // 移除用户数据
      console.log('User logged out.');
    } catch (error) {
      console.error('Error clearing user data from AsyncStorage:', error);
    } finally {
      setLoading(false); // 结束加载
    }
  };

  // 如果正在加载用户数据，显示加载状态
  if (loading) {
    return null; // 或者返回一个加载组件，例如：<LoadingScreen />
  }

  return (
    <UserContext.Provider value={{user, setUser, login, logout}}>
      {children}
    </UserContext.Provider>
  );
};

// 自定义 Hook，用于在组件中访问用户数据
export const useUser = () => useContext(UserContext);
