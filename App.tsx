import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {CartProvider} from './src/context/CartContext';
import {OrderProvider} from './src/context/OrderContext';
import {UserProvider, useUser} from './src/context/UserContext';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen'; // 引入注册页面
import Toast from 'react-native-toast-message';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const {user} = useUser();

  if (user === undefined) {
    return null; // 或者显示一个加载指示器
  }

  return (
    <Stack.Navigator>
      {!user ? (
        <>
          {/* 登录页面 */}
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          {/* 注册页面 */}
          <Stack.Screen
            name="RegisterScreen"
            component={RegisterScreen}
            options={{title: 'Register'}}
          />
        </>
      ) : (
        // 主应用导航
        <Stack.Screen
          name="HomePage"
          component={BottomTabNavigator}
          options={{headerShown: false}}
        />
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <UserProvider>
      <OrderProvider>
        <CartProvider>
          <NavigationContainer>
            <AppNavigator />
            <Toast />
          </NavigationContainer>
        </CartProvider>
      </OrderProvider>
    </UserProvider>
  );
};

export default App;
