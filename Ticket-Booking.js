import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Stack Navigator for Booking Details and Payment
const Stack = createStackNavigator();

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Search') {
              iconName = 'search';
            } else if (route.name === 'Bookings') {
              iconName = 'book';
            } else if (route.name === 'Profile') {
              iconName = 'person';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FF6B6B', // Red color for active tab
          tabBarInactiveTintColor: '#888', // Gray color for inactive tab
          tabBarStyle: {
            backgroundColor: '#FFFFFF', // White background for the tab bar
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 10,
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Bookings" component={MyBookingsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Home Stack Navigator (for Booking Details and Payment)
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookingDetails"
        component={BookingDetailsScreen}
        options={{ title: 'Booking Details' }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
    </Stack.Navigator>
  );
};

// Home Screen
const HomeScreen = ({ navigation }) => {
   const [events, setEvents] = useState([
    { id: 1, name: 'Avengers: Endgame', type: 'movie', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDLGqatUqSBfHww6iSqpA8K_SamMhinjoy4g&s' },
    { id: 2, name: 'Coldplay Concert', type: 'event', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsFmcfKrttr1UaNmPkSpRph06JmgK1fAImzg&s' },
    { id: 3, name: 'Flight to Paris', type: 'travel', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTohEK_YU3BaZH8dV7IQXISgxogc6q2j9sGcw&s' },
  ]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ticket Booking App</Text>

      {/* Events List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() => navigation.navigate('BookingDetails', { item })}
          >
            <Image source={{ uri: item.image }} style={styles.eventImage} />
            <View style={styles.eventTextContainer}>
              <Text style={styles.eventName}>{item.name}</Text>
              <Text style={styles.eventType}>{item.type}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
};

// Search Screen
const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search for events, movies, or flights..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />
      <Button mode="contained" onPress={() => Alert.alert('Search', `Query: ${searchQuery}`)}>
        Search
      </Button>
    </View>
  );
};

// Booking Details Screen
const BookingDetailsScreen = ({ route, navigation }) => {
  const { item } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.name}</Text>
      <Image source={{ uri: item.image }} style={styles.eventImageLarge} />
      <Text style={styles.eventType}>{item.type}</Text>
      <Button mode="contained" onPress={() => navigation.navigate('Payment', { item })}>
        Book Now
      </Button>
    </View>
  );
};

// Payment Screen
const PaymentScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const handleConfirmPayment = async () => {
    try {
      // Save the booking to AsyncStorage
      const newBooking = {
        id: Date.now(),
        name: item.name,
        type: item.type,
        date: new Date().toISOString(),
      };
      const bookings = JSON.parse(await AsyncStorage.getItem('bookings')) || [];
      bookings.push(newBooking);
      await AsyncStorage.setItem('bookings', JSON.stringify(bookings));

      // Navigate to My Bookings Screen
      navigation.navigate('Bookings');
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>
      <Text>Choose Payment Method:</Text>
      <TouchableOpacity
        style={styles.paymentOption}
        onPress={() => setPaymentMethod('credit_card')}
      >
        <Icon name="credit-card" size={24} color="#2196F3" />
        <Text style={styles.paymentText}>Credit Card</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.paymentOption}
        onPress={() => setPaymentMethod('paypal')}
      >
        <Icon name="paypal" size={24} color="#003087" />
        <Text style={styles.paymentText}>PayPal</Text>
      </TouchableOpacity>
      <Button mode="contained" onPress={handleConfirmPayment}>
        Confirm Payment
      </Button>
    </View>
  );
};

// My Bookings Screen
const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = JSON.parse(await AsyncStorage.getItem('bookings')) || [];
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    fetchBookings();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.bookingCard}>
            <Text style={styles.bookingName}>{item.name}</Text>
            <Text style={styles.bookingType}>{item.type}</Text>
            <Text style={styles.bookingDate}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

// Profile Screen
const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>Name: John Doe</Text>
      <Text>Email: john.doe@example.com</Text>
      <Text>Payment History:</Text>
      <FlatList
        data={[
          { id: 1, amount: '$50', date: '2023-10-01' },
          { id: 2, amount: '$100', date: '2023-10-05' },
        ]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.paymentCard}>
            <Text style={styles.paymentAmount}>{item.amount}</Text>
            <Text style={styles.paymentDate}>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#FF6B6B', // Red color for titles
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventImageLarge: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventTextContainer: {
    padding: 10,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventType: {
    fontSize: 14,
    color: '#888',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  paymentText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  bookingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingType: {
    fontSize: 14,
    color: '#888',
  },
  bookingDate: {
    fontSize: 14,
    color: '#888',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentDate: {
    fontSize: 14,
    color: '#888',
  },
});