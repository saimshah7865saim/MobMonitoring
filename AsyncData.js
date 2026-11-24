import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Checkbox } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";




export default function AsyncData() {
    const [uname, setUname] = useState('');
    const [pass, setPass] = useState('');
    const [msg, setMsg] = useState('---');
    const [remember, setRemember] = useState(false);

    useEffect(() => {
        getData();
    }, []);

    const saveData = async () => {
        if (remember) {
            try {
                await AsyncStorage.setItem('userName', uname);
                await AsyncStorage.setItem('password', pass)
                // await AsyncStorage.setItem('password', pass);
                setMsg('Data Saved')
            } catch (error) {
                setMsg(error.message)
            }
        }
        else {
            try {
                await AsyncStorage.clear();
            } catch (error) {

            }
        }
    }

    const clearData = async () => {
        try {
            await AsyncStorage.clear();
            setMsg('Data Removed')
        } catch (error) {
            setMsg(error.message)
        }
    }

    const getData = async () => {
        try {
            let dbUserName = await AsyncStorage.getItem('userName');
            let dbPassword = await AsyncStorage.getItem('password');
            if (dbUserName !== null) {
                setUname(dbUserName)
                setPass(dbPassword)
                setRemember(true)
            }
        } catch (error) {

        }
    }
    return (
        <SafeAreaView style={{
            flex: 1, padding: 10, justifyContent: 'center',

        }}>
            <View style={{ gap: 10, alignItems: 'center', }}>
                <TextInput placeholder="Enter Username" style={ss.txtInp} onChangeText={setUname} value={uname} />
                <TextInput placeholder="Enter Password" style={ss.txtInp} onChangeText={setPass} value={pass} />
            </View>
            <View style={{ flexDirection: 'row', margin: 15, alignItems: 'center', }}>
                <Checkbox status={remember ? 'checked' : 'unchecked'} onPress={() => setRemember(!remember)} />
                <Text style={ss.txt}>Remember Me</Text>
            </View>
            <Text style={[ss.txt, { textAlign: 'center', }]}>{msg}</Text>
            <Pressable
                onPress={saveData}
                android_ripple={{ color: 'lightblue', }}
                style={ss.btn}>
                <Text style={{ textAlign: 'center', fontSize: 25, color: 'white', }}>LOGIN</Text>
            </Pressable>
            <Pressable
                onPress={clearData}
                android_ripple={{ color: 'lightblue', }}
                style={ss.btn}>
                <Text style={{ textAlign: 'center', fontSize: 25, color: 'white', }}>CLEAR DATA</Text>
            </Pressable>
        </SafeAreaView>)
}
const ss = StyleSheet.create({
    btn: {
        backgroundColor: 'blue',
        margin: 10,
        borderRadius: 10,
        padding: 10,
        width: '50%',
        alignSelf: 'center',
    },
    txt: {
        fontSize: 20,
        color: 'gray',
    },
    txtInp: {
        padding: 10,
        borderWidth: 2,
        borderColor: 'gray',
        borderRadius: 10,
        width: '90%',
        fontSize: 20,
    }
});