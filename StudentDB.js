import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    FlatList,
    Alert,
    StyleSheet,
} from 'react-native';

import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
    { name: 'StudentDB.db' },
    () => console.log('Database opened'),
    error => console.log(error),
);








function StudentDB() {
    const [regNo, setRegNo] = useState('');
    const [name, setName] = useState('');
    const [cgpa, setCgpa] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS Students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          regNo TEXT,
          name TEXT,
          cgpa REAL
        )`,
                [],
                () => showAll(),
            );
        });
    }, []);

    // CLEAR FORM
    const clearForm = () => {
        setRegNo('');
        setName('');
        setCgpa('');
        setSelectedId(null);
    };

    // ADD STUDENT
    const addStudent = () => {
        if (!regNo.trim() || !name.trim() || !cgpa.trim()) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        const value = Number(cgpa);

        if (!Number.isFinite(value) || value < 0 || value > 4) {
            Alert.alert('Error', 'CGPA must be between 0 and 4');
            return;
        }

        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO Students (regNo, name, cgpa) VALUES (?, ?, ?)',
                [regNo.trim(), name.trim(), value],
                () => {
                    Alert.alert('Success', 'Student added');
                    clearForm();
                    showAll();
                },
            );
        });
    };

    // SHOW ALL STUDENTS
    const showAll = () => {
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM Students ORDER BY id DESC',
                [],
                (tx, result) => {
                    const data = [];

                    for (let i = 0; i < result.rows.length; i++) {
                        data.push(result.rows.item(i));
                    }

                    setStudents(data);
                });
        });
    };

    // SELECT STUDENT
    const selectStudent = item => {
        setSelectedId(item.id);
        setRegNo(item.regNo);
        setName(item.name);
        setCgpa(String(item.cgpa));
    };

    // UPDATE STUDENT
    const updateStudent = () => {
        if (selectedId === null) {
            Alert.alert('Error', 'Select a student from the list first');
            return;
        }

        if (!regNo.trim() || !name.trim() || !cgpa.trim()) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        const value = Number(cgpa);

        if (!Number.isFinite(value) || value < 0 || value > 4) {
            Alert.alert('Error', 'CGPA must be between 0 and 4');
            return;
        }

        db.transaction(tx => {
            tx.executeSql(
                'UPDATE Students SET regNo = ?, name = ?, cgpa = ? WHERE id = ?',
                [regNo.trim(), name.trim(), value, selectedId],
                () => {
                    Alert.alert('Success', 'Student updated');
                    clearForm();
                    showAll();
                },
            );
        });
    };

    // DELETE STUDENT
    const deleteStudent = () => {
        if (selectedId === null) {
            Alert.alert('Error', 'Select a student from the list first');
            return;
        }

        db.transaction(tx => {
            tx.executeSql(
                'DELETE FROM Students WHERE id = ?',
                [selectedId],
                () => {
                    Alert.alert('Success', 'Student deleted');
                    clearForm();
                    showAll();
                },
            );
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Student Management</Text>

            <TextInput
                style={styles.input}
                placeholder="Registration Number"
                value={regNo}
                onChangeText={setRegNo}
            />

            <TextInput
                style={styles.input}
                placeholder="Student Name"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="CGPA (0-4)"
                value={cgpa}
                onChangeText={setCgpa}
                keyboardType="decimal-pad"
            />

            <View style={styles.row}>
                <Pressable style={styles.button} onPress={addStudent}>
                    <Text style={styles.buttonText}>Add</Text>
                </Pressable>

                <Pressable style={styles.button} onPress={updateStudent}>
                    <Text style={styles.buttonText}>Update</Text>
                </Pressable>
            </View>

            <View style={styles.row}>
                <Pressable style={styles.button} onPress={deleteStudent}>
                    <Text style={styles.buttonText}>Delete</Text>
                </Pressable>

                <Pressable style={styles.button} onPress={clearForm}>
                    <Text style={styles.buttonText}>Clear</Text>
                </Pressable>
            </View>

            <Pressable style={styles.showButton} onPress={showAll}>
                <Text style={styles.buttonText}>Show All Students</Text>
            </Pressable>

            <Text style={styles.subHeading}>Student Records</Text>

            <FlatList
                data={students}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.student}
                        onPress={() => selectStudent(item)}>
                        <Text style={styles.studentText}>
                            {item.regNo} | {item.name} | CGPA: {item.cgpa}
                        </Text>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>No students found</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#F5F5F5',
    },
    heading: {
        fontSize: 23,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 6,
        paddingHorizontal: 12,
        marginBottom: 10,
        color: '#222',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        backgroundColor: '#1976D2',
        padding: 12,
        margin: 4,
        borderRadius: 6,
        alignItems: 'center',
    },
    showButton: {
        backgroundColor: '#218838',
        padding: 12,
        marginTop: 5,
        borderRadius: 6,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    subHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    student: {
        backgroundColor: 'white',
        padding: 12,
        marginBottom: 7,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    studentText: {
        fontSize: 14,
        color: '#222',
    },
    empty: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
});

export default StudentDB;
