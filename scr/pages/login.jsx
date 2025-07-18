import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axiosInstance from '../utils/api'; // Ensure this is the correct path to your axios instance

const ClientAccess = ({ onAccessGranted }) => {
  const [clientId, setClientId] = useState('');

  const handleAccess = () => {
    if (clientId) {
      // Update the Axios instance with the new database
      axiosInstance.defaults.params = { db: clientId };
      onAccessGranted(clientId); // Notify parent component that access is granted
    } else {
      alert('Please enter a valid client ID.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Client Access</Text>
      <TextInput
        placeholder="Enter Client ID"
        value={clientId}
        onChangeText={setClientId}
        style={styles.input}
      />
      <Button title="Grant Access" onPress={handleAccess} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
});

export default ClientAccess;
