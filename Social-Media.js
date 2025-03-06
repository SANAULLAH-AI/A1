import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // For image uploads
import { Ionicons } from '@expo/vector-icons'; // For icons
import { Video } from 'expo-av'; // For video playback

const { width, height } = Dimensions.get('window');

const App = () => {
  // State for authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // State for posts
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'user1',
      content: 'This is a text post!',
      type: 'text',
      likes: 10,
      comments: [],
    },
    {
      id: 2,
      user: 'user2',
      content: 'https://picsum.photos/500',
      type: 'image',
      likes: 20,
      comments: [],
    },
    {
      id: 3,
      user: 'user3',
      content: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      type: 'video',
      likes: 30,
      comments: [],
    },
  ]);
  const [newPost, setNewPost] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [newPostVideo, setNewPostVideo] = useState(null);

  // State for profile
  const [profile, setProfile] = useState({
    bio: 'Welcome to my profile!',
    posts: [],
    followers: 0,
    following: 0,
    isFollowing: false,
  });

  // State for chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // State for notifications
  const [notifications, setNotifications] = useState([]);

  // State for modals
  const [isCreatePostModalVisible, setIsCreatePostModalVisible] = useState(false);
  const [activeScreen, setActiveScreen] = useState('Feed'); // Track active screen

  // Login and Signup
  const handleLogin = () => {
    if (username && password) {
      setIsLoggedIn(true);
      setNotifications([{ id: 1, content: 'Welcome back!' }]);
    } else {
      Alert.alert('Error', 'Please enter username and password');
    }
  };

  const handleSignup = () => {
    if (username && password) {
      setIsLoggedIn(true);
      setProfile({ ...profile, bio: `Hi, I'm ${username}!` });
      setNotifications([{ id: 1, content: 'Welcome to the app!' }]);
    } else {
      Alert.alert('Error', 'Please enter username and password');
    }
  };

  // Create Post
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      if (result.type === 'image') {
        setNewPostImage(result.uri);
        setNewPostVideo(null);
      } else if (result.type === 'video') {
        setNewPostVideo(result.uri);
        setNewPostImage(null);
      }
    }
  };

  const handleCreatePost = () => {
    if (newPost || newPostImage || newPostVideo) {
      const post = {
        id: posts.length + 1,
        user: username,
        content: newPostImage || newPostVideo || newPost,
        type: newPostImage ? 'image' : newPostVideo ? 'video' : 'text',
        likes: 0,
        comments: [],
      };
      setPosts([post, ...posts]); // Add the new post to the top of the feed
      setProfile((prevProfile) => ({
        ...prevProfile,
        posts: [post, ...prevProfile.posts], // Add the new post to the profile posts
      }));
      setNewPost('');
      setNewPostImage(null);
      setNewPostVideo(null);
      setIsCreatePostModalVisible(false);
    }
  };

  // Like Post
  const handleLikePost = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  // Send Message
  const handleSendMessage = () => {
    if (newMessage) {
      setMessages([...messages, { id: messages.length + 1, content: newMessage, user: 'You' }]);
      setNewMessage('');
    }
  };

  // Follow/Unfollow User
  const handleFollow = () => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      followers: prevProfile.isFollowing ? prevProfile.followers - 1 : prevProfile.followers + 1,
      isFollowing: !prevProfile.isFollowing,
    }));
    setNotifications([
      ...notifications,
      {
        id: notifications.length + 1,
        content: profile.isFollowing ? 'You unfollowed the user.' : 'You followed the user!',
      },
    ]);
  };

  // Render Login/Signup Screen
  if (!isLoggedIn) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authTitle}>Social Media App</Text>
        <TextInput
          style={styles.authInput}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.authInput}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.authButton} onPress={handleLogin}>
          <Text style={styles.authButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.authButton} onPress={handleSignup}>
          <Text style={styles.authButtonText}>Signup</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render Main App
  return (
    <View style={styles.container}>
      {/* Status Bar for Android */}
      <StatusBar backgroundColor="#007BFF" barStyle="light-content" />

      {/* App Name Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social Media App</Text>
      </View>

      {/* Top Navigation Bar */}
      <View style={styles.topNavBar}>
        {['Feed', 'Profile', 'Chat', 'Notifications'].map((screen) => (
          <TouchableOpacity
            key={screen}
            style={[
              styles.navItem,
              activeScreen === screen && styles.navItemActive,
            ]}
            onPress={() => setActiveScreen(screen)}
          >
            <Ionicons
              name={
                screen === 'Feed'
                  ? 'home'
                  : screen === 'Profile'
                  ? 'person'
                  : screen === 'Chat'
                  ? 'chatbubbles'
                  : 'notifications'
              }
              size={24}
              color={activeScreen === screen ? '#007BFF' : '#888'}
            />
            <Text
              style={[
                styles.navText,
                activeScreen === screen && styles.navTextActive,
              ]}
            >
              {screen}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feed Screen */}
      {activeScreen === 'Feed' && (
        <ScrollView style={styles.screenContainer}>
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.post}>
                {/* Post Header */}
                <View style={styles.postHeader}>
                  <Ionicons name="person-circle" size={40} color="#007BFF" />
                  <Text style={styles.postUser}>{item.user}</Text>
                </View>

                {/* Post Content */}
                {item.type === 'image' && (
                  <Image source={{ uri: item.content }} style={styles.postImage} />
                )}
                {item.type === 'video' && (
                  <Video
                    source={{ uri: item.content }}
                    style={styles.postVideo}
                    useNativeControls
                    resizeMode="cover"
                    isLooping
                  />
                )}
                {item.type === 'text' && (
                  <Text style={styles.postContent}>{item.content}</Text>
                )}

                {/* Post Actions */}
                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.postAction}
                    onPress={() => handleLikePost(item.id)}
                  >
                    <Ionicons name="heart-outline" size={24} color="#FF4444" />
                    <Text style={styles.postActionText}>{item.likes} Likes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="chatbubble-outline" size={24} color="#888" />
                    <Text style={styles.postActionText}>Comment</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="share-outline" size={24} color="#888" />
                    <Text style={styles.postActionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </ScrollView>
      )}

      {/* Profile Screen */}
      {activeScreen === 'Profile' && (
        <ScrollView style={styles.screenContainer}>
          <View style={styles.profileHeader}>
            <Ionicons name="person-circle" size={80} color="#007BFF" />
            <Text style={styles.profileUsername}>{username}</Text>
            <Text style={styles.profileBio}>{profile.bio}</Text>
            <View style={styles.profileStats}>
              <Text style={styles.profileStat}>Followers: {profile.followers}</Text>
              <Text style={styles.profileStat}>Following: {profile.following}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.followButton,
                profile.isFollowing && styles.followButtonActive,
              ]}
              onPress={handleFollow}
            >
              <Text style={styles.followButtonText}>
                {profile.isFollowing ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Create Post Button in Profile Screen */}
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={() => setIsCreatePostModalVisible(true)}
          >
            <Ionicons name="add-circle" size={40} color="#007BFF" />
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Chat Screen */}
      {activeScreen === 'Chat' && (
        <View style={styles.screenContainer}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.message,
                  item.user === 'You' ? styles.messageRight : styles.messageLeft,
                ]}
              >
                <Text style={styles.messageText}>{item.content}</Text>
              </View>
            )}
          />
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity style={styles.chatSendButton} onPress={handleSendMessage}>
              <Ionicons name="send" size={24} color="#007BFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Notifications Screen */}
      {activeScreen === 'Notifications' && (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.notification}>
              <Text style={styles.notificationText}>{item.content}</Text>
            </View>
          )}
        />
      )}

      {/* Create Post Modal */}
      <Modal visible={isCreatePostModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="What's on your mind?"
              value={newPost}
              onChangeText={setNewPost}
              multiline
            />
            <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
              <Text style={styles.modalButtonText}>Upload Image/Video</Text>
            </TouchableOpacity>
            {newPostImage && <Image source={{ uri: newPostImage }} style={styles.previewImage} />}
            {newPostVideo && (
              <Video
                source={{ uri: newPostVideo }}
                style={styles.previewVideo}
                useNativeControls
                resizeMode="cover"
                isLooping
              />
            )}
            <TouchableOpacity style={styles.modalButton} onPress={handleCreatePost}>
              <Text style={styles.modalButtonText}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setIsCreatePostModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007BFF',
  },
  authInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  authButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    backgroundColor: '#007BFF',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  navItem: {
    alignItems: 'center',
  },
  navItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
  },
  navText: {
    fontSize: 14,
    color: '#888',
  },
  screenContainer: {
    flex: 1,
    padding: 10,
  },
  post: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postUser: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  postVideo: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionText: {
    fontSize: 14,
    color: '#888',
    marginLeft: 5,
  },
  createPostButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileUsername: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileBio: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  profileStat: {
    fontSize: 16,
    color: '#333',
  },
  followButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    width: '50%',
    alignItems: 'center',
  },
  followButtonActive: {
    backgroundColor: '#ccc',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5e5',
  },
  messageRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#007BFF',
  },
  messageText: {
    fontSize: 14,
    color: '#fff',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  chatSendButton: {
    padding: 10,
  },
  notification: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  previewVideo: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default App;