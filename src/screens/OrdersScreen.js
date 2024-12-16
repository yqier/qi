import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useOrders} from '../context/OrderContext';
import {BASE_URL} from '../config/BASE_URLS';

const OrdersScreen = () => {
  const {orders, loading, refreshOrders} = useOrders();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true); // 用于避免无限刷新

  // 格式化时间
  const formatDateFromEpoch = epochTime => {
    if (!epochTime) return 'Unknown';
    const date = new Date(Number(epochTime));
    return date.toLocaleString(); // 返回字符串
  };
  // 页面聚焦时刷新订单，仅第一次加载时触发
  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad) {
        refreshOrders();
        setIsFirstLoad(false); // 确保只刷新一次
      }
    }, [isFirstLoad, refreshOrders]),
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setIsRefreshing(false);
  };

  if (loading && isFirstLoad) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No orders found.</Text>
      </View>
    );
  }

  // 对订单按时间降序排序
  const sortedOrders = orders.sort(
    (a, b) => Number(b.orderTime) - Number(a.orderTime),
  );

  const renderOrderItem = ({item}) => {
    if (!item || !item.food) {
      return null;
    }

    const totalPrice = (item.food.price || 0) * (item.quantity || 0);

    return (
      <View style={styles.orderCard}>
        <Text style={styles.orderId}>
          Order ID: {item.orderId ? String(item.orderId) : 'Unknown'}
        </Text>
        <Text style={styles.orderStatus}>
          Status: {item.status || 'Unknown'}
        </Text>
        <Text style={styles.orderTime}>
          Order Time: {formatDateFromEpoch(item.orderTime) || 'Unknown'}
        </Text>
        <View style={styles.foodContainer}>
          <Image
            source={{
              uri: `${BASE_URL}/api/food/${item.food.image1}`,
            }}
            style={styles.foodImage}
          />
          <View style={styles.foodDetails}>
            <Text style={styles.foodName}>
              {item.food.name || 'No name available'}
            </Text>
            <Text style={styles.foodDescription}>
              {item.food.description || 'No description available'}
            </Text>
            <Text style={styles.foodDescription}>
              Quantity: {String(item.quantity || 0)}
            </Text>
            <Text style={styles.foodDescription}>
              Price per unit: {String(item.food.price || 0)}₽
            </Text>
          </View>
        </View>
        <View style={styles.deliveryContainer}>
          {item.deliveryPerson ? (
            <Text style={styles.deliveryPhone}>
              Deliveryman Phone: {item.deliveryPerson.phoneNo || 'Unknown'}
            </Text>
          ) : (
            <Text style={styles.deliveryPhone}>Food is being prepared</Text>
          )}
        </View>
        <View style={styles.separator} />
        <View style={styles.deliveryContainer}>
          {item.deliveryDate ? (
            <Text style={styles.deliveryTime}>
              Delivery Time: {item.deliveryDate || 'N/A'}{' '}
              {item.deliveryTime || 'N/A'}
            </Text>
          ) : (
            <Text style={styles.deliveryTime}>
              The delivery man is delivering
            </Text>
          )}
        </View>
        <Text style={styles.orderTotal}>
          Total Price: {String(totalPrice || 0)}₽
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={sortedOrders} // 使用排序后的数据
      keyExtractor={item =>
        item.orderId?.toString() || Math.random().toString()
      }
      renderItem={renderOrderItem}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 14,
    color: '#666',
  },
  orderTime: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  foodContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  foodDetails: {
    justifyContent: 'center',
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodDescription: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  deliveryPhone: {
    fontSize: 15, // 略微增大字体
    color: '#555', // 中性色，不显突兀
    marginVertical: 5, // 上下间距
    fontWeight: '400', // 正常字体
  },

  // 修改 deliveryTime 样式
  deliveryTime: {
    fontSize: 15, // 保持与电话一致
    color: '#333', // 深一点的颜色，突出重要信息
    marginVertical: 5, // 上下间距
    fontWeight: '500', // 半粗字体
  },

  // 添加 deliveryContainer 样式用于排列内容
  deliveryContainer: {
    marginTop: 10, // 内容之间的间距
    paddingVertical: 5, // 垂直内间距
    backgroundColor: '#fff', // 保持背景白色
  },

  // 添加通用的分隔线样式
  separator: {
    height: 1, // 分隔线高度
    backgroundColor: '#eee', // 分隔线浅灰色
    marginVertical: 10, // 上下间距
  },
});

export default OrdersScreen;
