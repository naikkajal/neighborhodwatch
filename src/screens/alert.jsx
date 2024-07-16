import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import { firestore, auth } from '../../firebase'; 
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

const Alert = () => {
  const [alertText, setAlertText] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const q = query(collection(firestore, 'alerts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const handleAddAlert = async () => {
    if (alertText.trim() === '') return;

    try {
      const currentUserEmail = auth.currentUser.email;

      await addDoc(collection(firestore, 'alerts'), {
        text: alertText,
        timestamp: serverTimestamp(),
        email: currentUserEmail,
      });

      console.log('Alert added successfully');
      setAlertText('');
      setShowInput(false);
    } catch (error) {
      console.error('Error adding alert: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Alerts</Text>
        <TouchableOpacity onPress={() => setShowInput(true)}>
          <View style={styles.newAlertContainer}>
            <Text style={styles.newAlertText}>New Alert</Text>
          </View>
        </TouchableOpacity>
      </View>

      {showInput && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder='Enter alert text'
            value={alertText}
            onChangeText={setAlertText}
          />
          <TouchableOpacity onPress={handleAddAlert}>
            <Text style={styles.addButton}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={alerts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.alertItem}>
            <Text style={styles.alertText}>{item.text}</Text>
            <Text style={styles.alertTimestamp}>
              {item.timestamp?.toDate().toLocaleString()}, by {item.email}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop:40
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft:13
  },
  newAlertContainer: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  newAlertText: {
    color: '#fff',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  addButton: {
    marginLeft: 10,
    fontSize: 30,
    color: '#4CAF50',
  },
  alertItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  alertText: {
    fontSize: 16,
  },
  alertTimestamp: {
    fontSize: 12,
    color: 'gray',
  },
});

export default Alert;
