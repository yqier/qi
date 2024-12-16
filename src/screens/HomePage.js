import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Carousel from 'react-native-snap-carousel'; // 导入轮播图库
import {Dimensions} from 'react-native';
import {BASE_URL} from '../config/BASE_URLS';

const HomePage = ({navigation}) => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempSearchText, setTempSearchText] = useState('');

  const screenWidth = Dimensions.get('window').width;

  const carouselItems = [
    {id: 1, image: require('../images/lunbo.png')},
    {id: 2, image: require('../images/lunbo2.png')},
    {id: 3, image: require('../images/lunbo3.png')},
  ];

  useEffect(() => {
    fetchCategories();
    if (!selectedCategory && !searchText) {
      fetchFoods();
    }
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchFoods(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/category/fetch/all`);
      const data = await response.json();
      if (data && data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        console.error('Invalid category data:', data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
    setLoading(false);
  };

  const fetchFoods = async (
    category = selectedCategory,
    searchQuery = searchText,
  ) => {
    setLoading(true);
    try {
      let response;
      const baseUrl = `${BASE_URL}/api/food`;
      if (searchQuery) {
        response = await fetch(`${baseUrl}/search?foodName=${searchQuery}`);
      } else if (category) {
        response = await fetch(`${BASE_URL}/api/category/${category.id}/foods`);
      } else {
        response = await fetch(`${baseUrl}/fetch/all`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setFoods(data);
      } else if (data.foods && Array.isArray(data.foods)) {
        setFoods(data.foods);
      } else {
        console.error('Invalid foods data:', data);
        setFoods([]);
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      setFoods([]);
    }
    setLoading(false);
  };

  const handleCategorySelect = category => {
    setSelectedCategory(category);
    setSearchText('');
    fetchFoods(category);
  };

  const searchFoods = () => {
    setSelectedCategory(null);
    setSearchText(tempSearchText);
    fetchFoods(null, tempSearchText);
  };

  const descriptionToShow = (description, maxLength) => {
    if (description.length <= maxLength) {
      return description;
    } else {
      return description.substring(0, maxLength) + '...';
    }
  };

  const renderCarouselItem = ({item}) => (
    <View style={styles.carouselItem}>
      <Image source={item.image} style={styles.carouselImage} />
    </View>
  );

  const FoodCard = ({food}) => (
    <TouchableOpacity
      style={styles.foodCard}
      onPress={() => navigation.navigate('FoodDetail', {foodId: food.id})}>
      <Image
        source={{uri: `${BASE_URL}/api/food/${food.image1}`}}
        style={styles.foodImage}
      />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{food.name}</Text>
        <Text style={styles.foodPrice}>Price: {food.price}₽</Text>
        <Text style={styles.foodDescription}>
          {descriptionToShow(food.description, 50)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const handleReset = () => {
    setSearchText('');
    setTempSearchText('');
    setSelectedCategory(null);
    fetchFoods(null, '');
  };

  const renderItem = ({item, index}) => {
    if (index === 1) {
      // 轮播图部分
      return (
        <Carousel
          data={carouselItems}
          renderItem={renderCarouselItem}
          sliderWidth={screenWidth}
          itemWidth={screenWidth}
          autoplay
          autoplayInterval={12000}
          enableSnap
          loopClonesPerSide={carouselItems.length}
        />
      );
    } else if (index === 0) {
      // 搜索栏部分
      return (
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={handleReset} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food..."
            value={tempSearchText}
            onChangeText={setTempSearchText}
            onSubmitEditing={searchFoods}
          />
          <TouchableOpacity onPress={searchFoods} style={styles.searchIcon}>
            <Ionicons name="search" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      );
    } else if (index === 2) {
      // 分类部分
      return (
        <View>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}>
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory?.id === category.id &&
                      styles.selectedCategoryCard,
                  ]}
                  onPress={() => handleCategorySelect(category)}>
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory?.id === category.id &&
                        styles.selectedCategoryText,
                    ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text>No Categories Available</Text>
            )}
          </ScrollView>
        </View>
      );
    } else {
      // 食物部分
      return (
        <View>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? `${selectedCategory.name}` : 'Popular Foods'}
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : (
            <FlatList
              data={Array.isArray(foods) ? foods : []}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => <FoodCard food={item} />}
            />
          )}
        </View>
      );
    }
  };

  return (
    <FlatList
      data={[null, null, null, null]} // 包含多个部分的数组
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  carouselItem: {
    backgroundColor: '#ddd',
    borderRadius: 8,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  backButton: {
    marginRight: 10,
  },
  searchIcon: {
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginLeft: 10,
  },
  categoryScroll: {
    paddingVertical: 10,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8', // 淡灰背景色
    borderRadius: 8, // 圆角
    elevation: 3, // Android的阴影效果
    shadowColor: '#000', // iOS的阴影
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
  },
  selectedCategoryCard: {
    backgroundColor: '#007BFF', // 选中状态为蓝色
    elevation: 5, // 提升阴影效果
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333', // 默认字体颜色为深灰
  },
  selectedCategoryText: {
    color: '#fff', // 选中时文本颜色改为白色
  },
  foodCard: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  foodInfo: {
    justifyContent: 'center',
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    flex: 1,
    marginBottom: 5,
  },
  foodPrice: {
    fontSize: 14,
    color: '#007BFF',
  },
  foodDescription: {
    fontSize: 12,
    color: '#555',
  },
});

export default HomePage;
