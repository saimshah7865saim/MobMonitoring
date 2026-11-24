import React from "react";
import { View } from "react-native";
import { MyButton } from "./MyComponents";


export default function HomeScreen({ navigation }) {
  return (
    <View>
      <MyButton title="Add Section" onPress={() => navigation.navigate("AddSection")} />
      <MyButton title="Add Student" onPress={() => navigation.navigate("AddStudent")} />
      <MyButton title="Assign Grade" onPress={() => navigation.navigate("AssignGrade")} />
    </View>
  );
}