import React, {useEffect} from 'react'; // 添加 useEffect
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import HomePage from '../screens/HomePage';
import CartScreen from '../screens/CartScreen';
import FoodDetailScreen from '../screens/FoodDetailScreen';
import OrdersScreen from '../screens/OrdersScreen';
import DeliveryOrdersScreen from '../screens/DeliveryOrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CheckoutScreen from '../screens/CheckoutScreen'; // 引入 CheckoutScreen
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useUser} from '../context/UserContext';
import {ActivityIndicator, View} from 'react-native';
import OrderDetailScreen from '../screens/OrderDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomePage" // 避免冲突，改为 HomePage
        component={HomePage}
        options={{headerShown: false}}
      />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
    </Stack.Navigator>
  );
};

const CartStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CartScreen"
        component={CartScreen}
        options={{title: 'Your Cart'}}
      />
      <Stack.Screen
        name="CheckoutScreen"
        component={CheckoutScreen}
        options={{title: 'Checkout'}}
      />
    </Stack.Navigator>
  );
};

const OrderStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OrdersScreen" // 避免冲突，改为 HomePage
        component={OrdersScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  );
};

const BottomTabNavigator = () => {
  const {user} = useUser(); // 获取用户信息

  console.log('User:', user); // 调试输出
  console.log('User role:', user?.role); // 调试输出

  // 如果没有加载用户数据，则不渲染 Tab.Navigator
  if (!user) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  const isCustomer = user?.role === 'Customer';
  const isDeliveryPerson = user?.role === 'Delivery';

  useEffect(() => {
    console.log('User info updated:', user);
  }, [user]);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'DeliveryOrders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
      })}>
      {/* 顾客角色的导航 */}
      {isCustomer && (
        <>
          <Tab.Screen name="Home" component={HomeStack} />
          <Tab.Screen name="Cart" component={CartStack} />
          <Tab.Screen name="Orders" component={OrderStack} />
        </>
      )}

      {/* 外卖员角色的导航 */}
      {isDeliveryPerson && (
        <>
          <Tab.Screen name="Home" component={HomeStack} />
          <Tab.Screen name="DeliveryOrders" component={DeliveryOrdersScreen} />
        </>
      )}

      {/* 个人页面 */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
