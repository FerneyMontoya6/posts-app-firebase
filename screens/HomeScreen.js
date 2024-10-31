import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../firebase-config";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore/lite";
import { getAuth, onAuthStateChanged } from "firebase/auth"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 

export function HomeScreen({ navigation }) {
  const [postsList, setPostsList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const db = getFirestore(app);

  // Verifica si el usuario está autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        fetchPosts();
      } else {
        setIsAuthenticated(false);
        navigation.navigate("Login");
      }
    });
    return unsubscribe;
  }, [navigation]);

  const fetchPosts = async () => {
    if (isAuthenticated) {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPostsList(posts);
    }
  };

  const addPost = async () => {
    if (newPostTitle && newPostContent) {
      await addDoc(collection(db, "posts"), {
        title: newPostTitle,
        content: newPostContent,
      });
      setNewPostTitle("");
      setNewPostContent("");
      setModalVisible(false);
      fetchPosts(); 
    }
  };

  const deletePost = async (postId) => {
    await deleteDoc(doc(db, "posts", postId));
    fetchPosts(); 
  };

  if (!isAuthenticated) {
    return null; 
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.postsContainer}>
        {postsList.length === 0 ? (
          <Text>Loading...</Text>
        ) : (
          postsList.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent}>{post.content}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePost(post.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Post</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Post</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newPostTitle}
              onChangeText={setNewPostTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Content"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
            />
            <TouchableOpacity style={styles.addButtonModal} onPress={addPost}>
              <Text style={styles.buttonText}>Add Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  postsContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  postCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 3,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  postContent: {
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    borderColor: "#fff",
    borderWidth: 1,
    backgroundColor: "green",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  addButtonModal: {
    height: 40,
    backgroundColor: "#4CAF50", 
    marginVertical: 10,
    borderRadius: 5,
    elevation: 3, 
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "red", 
    padding: 10,
    borderRadius: 5,
    elevation: 3, 
  },
  buttonText: {
    color: "white", 
    fontSize: 16,
    textAlign: "center",
  },
});
