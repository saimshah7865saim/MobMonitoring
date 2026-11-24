import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { MyButton, MyField } from './MyComponents';
import { run } from './db';

export default function AddStudent({ navigation }) {
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [sectionId, setSectionId] = useState(null);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);

  const showAll = () => {
    run('SELECT * FROM sections ORDER BY id', [], setSections);
    run(
      'SELECT students.*, sections.name AS sectionName FROM students LEFT JOIN sections ON sections.id = students.sectionId ORDER BY students.id DESC',
      [],
      setStudents,
    );
  };

  useEffect(() => {
    showAll();
  }, []);

  const onAdd = () => {
    if (!name.trim() || !regNo.trim()) {
      Alert.alert('Error', 'Name aur Reg No likhein');
      return;
    }
    if (sectionId === null) {
      Alert.alert('Error', 'Section par tap karke chunein');
      return;
    }
    run(
      'INSERT INTO students (name, regNo, sectionId) VALUES (?, ?, ?)',
      [name.trim(), regNo.trim(), sectionId],
      () => {
        Alert.alert('Success', 'Student add ho gaya');
        setName('');
        setRegNo('');
        setSectionId(null);
        showAll();
      },
    );
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <MyField label="Name" value={name} onChangeText={setName} />
      <MyField label="Reg No" value={regNo} onChangeText={setRegNo} />

      <Text style={{ fontWeight: 'bold', margin: 10 }}>
       select Section  (tap karein):
      </Text>
      {sections.length === 0 ? (
        <Text style={{ marginLeft: 10 }}>
            Add Section 
        </Text>
      ) : (
        sections.map(s => (
          <Pressable
            key={s.id}
            onPress={() => setSectionId(s.id)}
            style={{
              padding: 10,
              marginHorizontal: 10,
              marginBottom: 4,
              borderWidth: 1,
              backgroundColor: sectionId === s.id ? '#b3d9ff' : 'white',
            }}>
            <Text>
              {sectionId === s.id ? '✔ ' : ''}
              {s.name} ({s.semester})
            </Text>
          </Pressable>
        ))
      )}

      <MyButton title="Add" onPress={onAdd} />
      <MyButton title="Cancel" onPress={() => navigation.goBack()} />

      <Text style={{ fontWeight: 'bold', margin: 10 }}>
        Saved Students ({students.length})
      </Text>
      {students.map(s => (
        <Text key={s.id} style={{ marginHorizontal: 10, marginBottom: 6 }}>
          {s.regNo} | {s.name} | {s.sectionName}
          {s.grade ? ' | Grade: ' + s.grade : ''}
        </Text>
      ))}
    </ScrollView>
  );
}