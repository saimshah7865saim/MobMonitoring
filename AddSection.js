import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { MyButton, MyField } from './MyComponents';
import { run } from './db';

export default function AddSection({ navigation }) {
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [sections, setSections] = useState([]);

  const showAll = () => {
    run('SELECT * FROM sections ORDER BY id DESC', [], setSections);
  };

  useEffect(() => {
    showAll();
  }, []);

  const onAdd = () => {
    if (!name.trim() || !semester.trim()) {
      Alert.alert('Error', 'Dono fields bharein');
      return;
    }
    run(
      'INSERT INTO sections (name, semester) VALUES (?, ?)',
      [name.trim(), semester.trim()],
      () => {
        Alert.alert('Success', 'Section add ho gaya');
        setName('');
        setSemester('');
        showAll();
      },
    );
  };

  return (
    <View>
      <MyField label="Section Name" value={name} onChangeText={setName} />
      <MyField label="Semester" value={semester} onChangeText={setSemester} />
      <MyButton title="Add" onPress={onAdd} />
      <MyButton title="Cancel" onPress={() => navigation.goBack()} />

      <Text style={{ fontWeight: 'bold', margin: 10 }}>
        Saved Sections ({sections.length})
      </Text>
      {sections.map(s => (
        <Text key={s.id} style={{ marginHorizontal: 10 }}>
          {s.name} | {s.semester}
        </Text>
      ))}
    </View>
  );
}