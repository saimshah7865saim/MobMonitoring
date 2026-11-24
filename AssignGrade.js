import React, { useEffect, useState } from 'react';
import { Text, ScrollView, Pressable, Alert } from 'react-native';
import { MyButton, MyField } from './MyComponents';
import { run } from './db';

export default function AssignGrade({ navigation }) {
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [sectionId, setSectionId] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [grade, setGrade] = useState('');

  useEffect(() => {
    run('SELECT * FROM sections ORDER BY id', [], setSections);
  }, []);

  const loadStudents = id => {
    run('SELECT * FROM students WHERE sectionId = ? ORDER BY id DESC', [id], setStudents);
  };

  const onPickSection = id => {
    setSectionId(id);
    setStudentId(null);
    loadStudents(id);
  };

  const onSave = () => {
    if (sectionId === null || studentId === null || !grade.trim()) {
      Alert.alert('Error', 'Section, Student aur Grade teeno chunein/bharein');
      return;
    }
    run(
      'UPDATE students SET grade = ? WHERE id = ?',
      [grade.trim(), studentId],
      () => {
        Alert.alert('Success', 'Grade save ho gaya');
        setGrade('');
        setStudentId(null);
        loadStudents(sectionId);
      },
    );
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <Text style={{ fontWeight: 'bold', margin: 10 }}>
        1. Section select:
      </Text>
      {sections.length === 0 ? (
        <Text style={{ marginLeft: 10 }}>Pehle Add Section se section banayen</Text>
      ) : (
        sections.map(s => (
          <Pressable
            key={s.id}
            onPress={() => onPickSection(s.id)}
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

      <Text style={{ fontWeight: 'bold', margin: 10 }}>
        2. Student select:
      </Text>
      {sectionId === null ? (
        <Text style={{ marginLeft: 10 }}>Pehle section select</Text>
      ) : students.length === 0 ? (
        <Text style={{ marginLeft: 10 }}>Is section mein koi student nahi</Text>
      ) : (
        students.map(st => (
          <Pressable
            key={st.id}
            onPress={() => setStudentId(st.id)}
            style={{
              padding: 10,
              marginHorizontal: 10,
              marginBottom: 4,
              borderWidth: 1,
              backgroundColor: studentId === st.id ? '#b3d9ff' : 'white',
            }}>
            <Text>
              {studentId === st.id ? '✔ ' : ''}
              {st.regNo} | {st.name} | Grade: {st.grade ? st.grade : '-'}
            </Text>
          </Pressable>
        ))
      )}

      <Text style={{ fontWeight: 'bold', margin: 10 }}>3. Grade likhein:</Text>
      <MyField label="Grade" value={grade} onChangeText={setGrade} />
      <MyButton title="Save" onPress={onSave} />
      <MyButton title="Cancel" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}