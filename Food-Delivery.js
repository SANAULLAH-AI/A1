// App.js
import React, { createContext, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, TextInput, Image, Animated, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Card, Title, Paragraph, Button, useTheme, Provider as PaperProvider } from 'react-native-paper';

// ================== Contexts ==================
const RestaurantContext = createContext();
const CartContext = createContext();
const AuthContext = createContext();

const RestaurantProvider = ({ children }) => {
  const [restaurants] = useState([
    {
      id: 1,
      name: 'Burger King',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUibVz66-twchJswxug5WzMRRDh48Jo-lwzQ&s',
      cuisine: 'Burgers, Fast Food',
      menu: [
        { id: 1, name: 'Whopper', price: 10, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtMiAQzxlHdSrRQv3pvWGF-ilO8U_5KsQ6BQ&s' },
        { id: 2, name: 'Cheeseburger', price: 8, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsMxvJzV0Uq_e-akzXZ48uG_z97EvNqN3p3Q&s' },
      ],
    },
    {
      id: 2,
      name: 'Pizza Hut',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbArzSlImtiVGWRPvhP1DUdNsO9as3DKo3-g&s',
      cuisine: 'Pizza, Italian',
      menu: [
        { id: 3, name: 'Pepperoni Pizza', price: 12, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXI_Ua2jMB71abWMT7ekTLu2hlGyubFT7rTg&s' },
        { id: 4, name: 'Veggie Pizza', price: 10, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPGwDN0_vHZrxCRHK5INShomf_ePEiUWw7qQ&s' },
      ],
    },
    {
      id: 3,
      name: 'Sushi Palace',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkykyhpVNbRl11uDTGsy1t4spUBbpGJiCnmw&s',
      cuisine: 'Japanese, Sushi',
      menu: [
        { id: 5, name: 'Sushi Roll', price: 15, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjrWQ7ETso19GGJjFMMQbZsrwUwJGKmoE8aQ&s' },
        { id: 6, name: 'Sashimi Platter', price: 20, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMd1EIGNd69bkRuGB2_ZQMbmlnLgJYbF6sxQ&s' },
      ],
    },
  ]);

  return <RestaurantContext.Provider value={{ restaurants }}>{children}</RestaurantContext.Provider>;
};

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const totalPrice = cart.reduce((total, item) => total + item.price, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const login = (email, password) => {
    if (email === credentials.email && password === credentials.password) {
      setUser({ email });
    } else {
      alert('Invalid email or password');
    }
  };

  const guestLogin = () => {
    setUser({ email: 'guest@example.com' });
  };

  const logout = () => {
    setUser(null);
  };

  const saveCredentials = (email, password) => {
    setCredentials({ email, password });
  };

  return (
    <AuthContext.Provider value={{ user, login, guestLogin, logout, saveCredentials, credentials }}>
      {children}
    </AuthContext.Provider>
  );
};

// ================== Screens ==================
const HomeScreen = ({ navigation }) => {
  const { restaurants } = React.useContext(RestaurantContext);
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          icon="account"
          onPress={() => navigation.navigate('Profile')}
          color={colors.primary}
        >
          Profile
        </Button>
      ),
    });
  }, [navigation, colors]);

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search restaurants..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => navigation.navigate('RestaurantDetails', { restaurant: item })}
          >
            <Card.Cover source={{ uri: item.image }} />
            <Card.Content>
              <Title style={{ color: colors.text }}>{item.name}</Title>
              <Paragraph style={{ color: colors.placeholder }}>{item.cuisine}</Paragraph>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const RestaurantDetailsScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const { addToCart } = React.useContext(CartContext);
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: restaurant.image }} />
        <Card.Content>
          <Title style={{ color: colors.text }}>{restaurant.name}</Title>
          <Paragraph style={{ color: colors.placeholder }}>{restaurant.cuisine}</Paragraph>
        </Card.Content>
      </Card>
      <FlatList
        data={restaurant.menu}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.menuItem}>
            <Card.Content>
              <Image source={{ uri: item.image }} style={styles.menuImage} />
              <Title style={{ color: colors.text }}>{item.name}</Title>
              <Paragraph style={{ color: colors.placeholder }}>${item.price}</Paragraph>
              <Button mode="contained" onPress={() => { addToCart(item); navigation.navigate('Cart'); }}>
                Add to Cart
              </Button>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const CartScreen = ({ navigation }) => {
  const { cart, totalPrice, removeFromCart } = React.useContext(CartContext);
  const { colors } = useTheme();

  // Animation state
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current; // Start off-screen

  // Function to show the success message
  const showMessage = () => {
    setShowSuccessMessage(true);
    Animated.timing(slideAnim, {
      toValue: 0, // Slide down to 0 (visible)
      duration: 500, // Animation duration
      useNativeDriver: true, // Use native driver for better performance
    }).start(() => {
      // Hide the message after 2 seconds
      setTimeout(() => {
        hideMessage();
      }, 2000);
    });
  };

  // Function to hide the success message
  const hideMessage = () => {
    Animated.timing(slideAnim, {
      toValue: -100, // Slide back up off-screen
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setShowSuccessMessage(false);
    });
  };

  // Handle order submission
  const handleSubmitOrder = () => {
    showMessage();

    // Navigate to Home after 2 seconds
    setTimeout(() => {
      navigation.navigate('Home');
    }, 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Success Message Box */}
      {showSuccessMessage && (
        <Animated.View
          style={[
            styles.successMessage,
            {
              transform: [{ translateY: slideAnim }], // Animate the vertical position
            },
          ]}
        >
          <Text style={styles.successMessageText}>Order successfully placed!</Text>
        </Animated.View>
      )}

      {/* Cart Items */}
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.cartItem}>
            <Card.Content>
              <Title style={{ color: colors.text }}>{item.name}</Title>
              <Paragraph style={{ color: colors.placeholder }}>${item.price}</Paragraph>
              <Button mode="outlined" onPress={() => removeFromCart(item.id)}>
                Remove
              </Button>
            </Card.Content>
          </Card>
        )}
      />

      {/* Total and Confirm Order Button */}
      <Card style={styles.totalCard}>
        <Card.Content>
          <Title style={{ color: colors.text }}>Total: ${totalPrice}</Title>
          <Button mode="contained" onPress={handleSubmitOrder}>
            Confirm Order
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const CheckoutScreen = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ color: colors.text }}>Payment Methods</Title>
          <Button mode="contained" onPress={() => navigation.navigate('OrderTracking')}>
            Pay Now
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const OrderTrackingScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ color: colors.text }}>Order Tracking</Title>
          <Paragraph style={{ color: colors.placeholder }}>Your order is on the way!</Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
};

const ProfileScreen = () => {
  const { credentials } = React.useContext(AuthContext);
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={{ color: colors.text }}>Profile</Title>
          <Paragraph style={{ color: colors.placeholder }}>Email: {credentials.email}</Paragraph>
          <Paragraph style={{ color: colors.placeholder }}>Password: {credentials.password}</Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
};

const LoginScreen = ({ navigation }) => {
  const { login, guestLogin, saveCredentials } = React.useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    saveCredentials(email, password); // Save credentials
    login(email, password); // Attempt login
    navigation.navigate('Home');
  };

  const handleGuestLogin = () => {
    guestLogin();
    navigation.navigate('Home');
  };

  return (
    <View style={styles.loginContainer}>
      {/* App Name with Fashionable Font */}
      <Text style={styles.appName}>Foodie</Text>

      {/* Login Card */}
      <Card style={styles.loginCard}>
        <Card.Content>
          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Login Button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            labelStyle={styles.buttonLabel}
          >
            Login
          </Button>

          {/* Guest Login Button */}
          <Button
            mode="outlined"
            onPress={handleGuestLogin}
            style={styles.guestButton}
            labelStyle={styles.buttonLabel}
          >
            Continue as Guest
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

// ================== Navigation ==================
const Stack = createStackNavigator();

const App = () => {
  return (
    <PaperProvider>
      <AuthProvider>
        <RestaurantProvider>
          <CartProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
                <Stack.Screen name="Cart" component={CartScreen} />
                <Stack.Screen name="Checkout" component={CheckoutScreen} />
                <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </CartProvider>
        </RestaurantProvider>
      </AuthProvider>
    </PaperProvider>
  );
};

// ================== Styles ==================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  card: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 3,
  },
  menuItem: {
    marginBottom: 8,
    borderRadius: 10,
    elevation: 2,
  },
  menuImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  cartItem: {
    marginBottom: 8,
    borderRadius: 10,
    elevation: 2,
  },
  totalCard: {
    marginTop: 16,
    borderRadius: 10,
    elevation: 3,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B6B', // Vibrant background color
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF', // White text for contrast
    fontFamily: 'sans-serif', // Use a fashionable font (e.g., 'Roboto', 'Montserrat')
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.3)', // Subtle shadow for depth
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  loginCard: {
    width: '90%', // Responsive width
    borderRadius: 15,
    elevation: 5,
    backgroundColor: '#FFF', // White background for the card
  },
  input: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#F5F5F5', // Light gray background for inputs
    borderRadius: 10,
    fontSize: 16,
    color: '#333', // Dark text for readability
  },
  loginButton: {
    marginBottom: 10,
    backgroundColor: '#4ECDC4', // Teal color for the login button
    borderRadius: 10,
    paddingVertical: 8,
  },
  guestButton: {
    marginBottom: 10,
    borderColor: '#4ECDC4', // Teal border for the guest button
    borderRadius: 10,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF', // White text for buttons
  },
  successMessage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4CAF50', // Green background
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Ensure it appears above other content
  },
  successMessageText: {
    color: '#FFF', // White text
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;