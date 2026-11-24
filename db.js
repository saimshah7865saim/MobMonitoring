import { Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  { name: 'CollegeDB.db' },
  () => console.log('DB opened'),
  e => console.log(e),
);

db.transaction(tx => {
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS sections (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, semester TEXT)',
    [],
  );
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, regNo TEXT, sectionId INTEGER, grade TEXT)',
    [],
  );
});

// Ek hi function har query ke liye. Result ki rows array mein deta hai.
export function run(sql, params, onDone) {
  db.transaction(tx => {
    tx.executeSql(
      sql,
      params,
      (t, result) => {
        const rows = [];
        for (let i = 0; i < result.rows.length; i++) {
          rows.push(result.rows.item(i));
        }
        if (onDone) {
          onDone(rows);
        }
      },
      (t, error) => {
        Alert.alert('DB Error', error.message);
        return false;
      },
    );
  });
}