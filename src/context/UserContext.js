import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [user, setUser] = useState(null); // 初始用户状态为空
  const [loading, setLoading] = useState(true); // 状态，表示是否在加载用户数据

  // 从 AsyncStorage 加载用户数据
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        console.log('User data loaded from AsyncStorage:', storedUser);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user data from AsyncStorage', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    console.log('User state in Context:', user); // 每次 user 状态变化时输出
  }, [user]);

  // 登录方法，设置角色并存储用户数据
  const login = async userData => {
    setUser(userData); // 更新用户状态
    await AsyncStorage.setItem('user', JSON.stringify(userData)); // 保存用户数据到 AsyncStorage
  };

  // 退出登录方法
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user'); // 移除用户数据
  };

  if (loading) {
    return null; // 或者可以返回一个加载组件
  }

  return (
    <UserContext.Provider value={{user, setUser, login, logout}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
