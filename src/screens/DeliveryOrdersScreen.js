import {useUser} from '../context/UserContext';
import axios from 'axios';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, {useState, useEffect} from 'react';
import {BASE_URL} from '../config/BASE_URLS';

const DeliveryOrdersScreen = ({navigation}) => {
  const {user} = useUser();
  const [allOrders, setAllOrders] = useState([]);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/order/fetch/delivery-wise?deliveryPersonId=${user.id}`,
        {
          headers: {Authorization: `Bearer ${user.token}`},
        },
      );
      const orders = response.data.orders || [];

      // 获取用户地址信息
      for (let order of orders) {
        const addressResponse = await axios.get(
          `${BASE_URL}/api/user/${order.user.id}/address`,
          {headers: {Authorization: `Bearer ${user.token}`}},
        );
        order.user.address = addressResponse.data || 'Address not found';
      }

      setAllOrders(orders);
    } catch (error) {
      console.error('Failed to obtain orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索订单
  const searchOrders = () => {
    if (!searchOrderId.trim()) {
      // 如果搜索框为空，显示所有订单
      fetchOrders();
      return;
    }

    const filtered = allOrders.filter(order =>
      order.orderId.toString().includes(searchOrderId.trim()),
    );
    if (filtered.length > 0) {
      setAllOrders(filtered);
    } else {
      Alert.alert('Not Found', 'No orders matched your search.');
    }
  };

  const clearSearch = () => {
    setSearchOrderId('');
    fetchOrders(); // 清空搜索时重新加载所有订单
  };

  useEffect(() => {
    if (!user) {
      console.log('User data is empty, please log in first');
      return;
    }
    fetchOrders();
  }, [user]);

  // 更新订单状态
  const updateOrderStatus = async order => {
    try {
      const currentTime = new Date();
      const formattedTime = currentTime
        .toISOString()
        .split('T')[1]
        .split('.')[0];
      const formattedDate = currentTime.toISOString().split('T')[0];

      const response = await axios.put(
        `${BASE_URL}/api/order/update/delivery-status`,
        {
          orderId: order.orderId,
          deliveryStatus: 'Delivered',
          deliveryTime: formattedTime,
          deliveryDate: formattedDate,
          deliveryId: user.id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      Alert.alert('Success', response.data.responseMessage);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };
  const formatDateFromTimeString = timeString => {
    try {
      // 获取当前日期
      const today = new Date();
      const datePart = today.toISOString().split('T')[0]; // 格式为 YYYY-MM-DD

      // 拼接日期和时间，并加上 UTC 时区
      const fullTimeString = `${datePart}T${timeString}Z`; // 假设返回的时间是 UTC 时间

      // 创建日期对象
      const date = new Date(fullTimeString);

      // 转换为本地时间格式
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting time string:', timeString);
      return 'Invalid Date';
    }
  };

  // 修改渲染订单项的时间显示
  const renderOrderItem = ({item}) => (
    <View style={styles.orderItem}>
      <View style={styles.foodContainer}>
        <Image
          source={{
            uri: `${BASE_URL}/api/food/${item.food.image1}`,
          }}
          style={styles.foodImage}
        />
        <View style={styles.foodDetails}>
          <Text style={styles.foodName}>{item.food.name}</Text>
          <Text style={styles.foodDescription}>{item.food.description}</Text>
        </View>
      </View>
      <View style={styles.orderInfo}>
        <Text style={styles.orderText}>Order ID: {item.orderId}</Text>
        <Text style={styles.orderText}>
          Customer Name: {item.user.firstName}
        </Text>
        <Text style={styles.orderText}>
          Customer Phone: {item.user.phoneNo}
        </Text>
        <Text style={styles.orderText}>
          Delivery Status:{' '}
          {item.status === 'Delivered' ? 'Delivered' : 'Pending'}
        </Text>
        {item.status === 'Delivered' && (
          <Text style={styles.orderText}>
            Delivery Time: {formatDateFromTimeString(item.deliveryTime)}
          </Text>
        )}
        {/* 显示用户地址 */}
        <Text style={styles.orderText}>
          Customer Address:{' '}
          {`${item.user.address.street}, ${item.user.address.city}`}
        </Text>
        {item.status !== 'Delivered' && (
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => updateOrderStatus(item)}>
            <Text style={styles.updateButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // 按状态分类
  const pendingOrders = allOrders.filter(order => order.status !== 'Delivered');
  const deliveredOrders = allOrders.filter(
    order => order.status === 'Delivered',
  );

  return (
    <View style={styles.container}>
      {/* 搜索和返回部分 */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Search Orders"
          value={searchOrderId}
          onChangeText={setSearchOrderId}
        />
        <TouchableOpacity onPress={searchOrders} style={styles.searchIcon}>
          <Ionicons name="search" size={24} color="#000" />
        </TouchableOpacity>
        {searchOrderId !== '' && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={24} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <View style={styles.orderSections}>
          {/* 未送达订单 */}
          <Text style={styles.sectionTitle}>Pending Orders</Text>
          <FlatList
            data={pendingOrders}
            keyExtractor={item => item.orderId.toString()}
            renderItem={renderOrderItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No pending orders.</Text>
            }
          />

          {/* 已送达订单 */}
          <Text style={styles.sectionTitle}>Delivered Orders</Text>
          <FlatList
            data={deliveredOrders}
            keyExtractor={item => item.orderId.toString()}
            renderItem={renderOrderItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No delivered orders.</Text>
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  searchIcon: {
    justifyContent: 'center',
  },
  clearButton: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  orderSections: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  foodContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  foodDetails: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodDescription: {
    fontSize: 14,
    color: '#666',
  },
  orderInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  orderText: {
    fontSize: 14,
    marginBottom: 5,
  },
  updateButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  updateButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default DeliveryOrdersScreen;
