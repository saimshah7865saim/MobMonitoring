import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';

export default function MyApp2() {
  return (
    <View style={styles.container}>

      <Text style={styles.heading}>My Profile</Text>

      <View style={styles.card}>

        <View style={styles.circle}>
          <Text style={styles.profileText}>S</Text>
        </View>

        <Text style={styles.name}>Syed Saim</Text>
        <Text style={styles.course}>React Native Developer</Text>

        <View style={styles.info}>
          <Text style={styles.label}>Student ID</Text>
          <Text style={styles.value}>2026-101</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.label}>Course</Text>
          <Text style={styles.value}>Mobile App Development</Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => Alert.alert('Welcome!', 'Hello Syed Saim')}
        >
          <Text style={styles.buttonText}>Click Me</Text>
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF0FF',
    justifyContent: 'center',
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#243B75',
  },

  card: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5,
  },

  circle: {
    width: 90,
    height: 90,
    backgroundColor: '#3156A3',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },

  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#222',
  },

  course: {
    fontSize: 15,
    color: 'gray',
    marginBottom: 25,
  },

  info: {
    width: '100%',
    padding: 12,
    backgroundColor: '#F1F4FA',
    borderRadius: 10,
    marginBottom: 10,
  },

  label: {
    color: 'gray',
    fontSize: 13,
  },

  value: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },

  button: {
    backgroundColor: '#3156A3',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 15,
  },

  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
  },
});