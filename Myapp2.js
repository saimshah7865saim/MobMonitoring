import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

const CITIES = [
  { label: 'Lahore (LHR)', code: 'LHR' },
  { label: 'Karachi (KHI)', code: 'KHI' },
  { label: 'Islamabad (ISB)', code: 'ISB' },
];

export default function Myapp2() {
  const [regNo, setRegNo] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [isEmployee, setIsEmployee] = useState(false);
  const [city, setCity] = useState(CITIES[0]);
  const [showCities, setShowCities] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');

  const addStudent = () => {
    if (!regNo.trim() || !name.trim()) {
      Alert.alert('Error', 'Reg no aur Name likhein');
      return;
    }
    if (students.some(s => s.regNo === regNo.trim())) {
      Alert.alert('Error', 'Yeh Reg no pehle se maujood hai');
      return;
    }
    setStudents([
      ...students,
      { regNo: regNo.trim(), name: name.trim(), gender, city: city.code, isEmployee },
    ]);
    setRegNo('');
    setName('');
    setGender('Male');
    setIsEmployee(false);
  };

  const deleteStudent = () => {
    if (!students.some(s => s.regNo === regNo.trim())) {
      Alert.alert('Error', 'Delete ke liye sahi Reg no likhein');
      return;
    }
    setStudents(students.filter(s => s.regNo !== regNo.trim()));
    setRegNo('');
    setName('');
  };

  const shown = students.filter(
    s =>
      query === '' ||
      s.regNo.includes(query) ||
      s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>ADD Student</Text>

      <TextInput
        style={styles.input}
        placeholder="Reg no"
        value={regNo}
        onChangeText={setRegNo}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      {/* Gender radio */}
      <View style={styles.row}>
        {['Male', 'Female'].map(g => (
          <TouchableOpacity key={g} style={styles.option} onPress={() => setGender(g)}>
            <View style={styles.radio}>
              {gender === g && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.optionText}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Employee checkbox */}
      <TouchableOpacity style={styles.option} onPress={() => setIsEmployee(!isEmployee)}>
        <View style={styles.checkbox}>
          {isEmployee && <Text style={styles.tick}>✓</Text>}
        </View>
        <Text style={styles.optionText}>Employee</Text>
      </TouchableOpacity>

      {/* City dropdown */}
      <TouchableOpacity style={styles.dropdown} onPress={() => setShowCities(!showCities)}>
        <Text style={styles.dropdownText}>{city.label}</Text>
        <Text>{showCities ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showCities &&
        CITIES.map(c => (
          <TouchableOpacity
            key={c.code}
            style={styles.dropdownItem}
            onPress={() => {
              setCity(c);
              setShowCities(false);
            }}>
            <Text style={styles.dropdownText}>{c.label}</Text>
          </TouchableOpacity>
        ))}

      {/* Add / Delete */}
      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, styles.add]} onPress={addStudent}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.delete]} onPress={deleteStudent}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Search by Reg no / Name"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => setQuery(searchText.trim())}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {shown.map(s => (
        <View key={s.regNo} style={styles.card}>
          <Text style={styles.cardTitle}>
            {s.regNo} - {s.name}
          </Text>
          <Text style={styles.cardSub}>
            {s.gender} | {s.city}
            {s.isEmployee ? ' | Employee' : ''}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 14, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: '#333' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  option: { flexDirection: 'row', alignItems: 'center', marginRight: 24, marginBottom: 12 },
  optionText: { fontSize: 16, marginLeft: 8 },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#007bff',
    alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: '#007bff' },
  checkbox: {
    width: 22, height: 22, borderWidth: 2, borderColor: '#555', borderRadius: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  tick: { fontSize: 16, color: '#007bff', fontWeight: 'bold' },
  dropdown: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  dropdownItem: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  dropdownText: { fontSize: 16 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  add: { backgroundColor: '#28a745' },
  delete: { backgroundColor: '#dc3545' },
  searchBtn: { backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 12, marginBottom: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardSub: { fontSize: 16, color: '#666', marginTop: 2 },
});