import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";

export function MyButton({ title,
    onPress,
    backgroundColor = '#0989dd',
    color = 'white',
    fontSize = 15,
    width,
    height,
}) {
    return (
        <View >
            <Pressable
                style={{
                    justifyContent: 'center',
                    alignItems: 'center', backgroundColor: backgroundColor, width: width, height: height
                }}
                onPress={onPress}
                android_ripple={{ color: '#0a559f', }}
            >
                <Text style={{ margin: 5, textAlign: 'center', color: color, fontSize: fontSize }}>{title}</Text>
            </Pressable>
        </View>
    );
}

// Label + text box ek row mein
export function MyField({ label, value, onChangeText }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', margin: 5 }}>
            <Text style={{ width: 110 }}>{label}</Text>
            <TextInput
                style={{ flex: 1, borderWidth: 1, padding: 5 }}
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
}

// Label + dropdown ek row mein
// items = [{ label: "Section A", value: 1 }, ...]
export function MyDropdown({ label, placeholder, items, selectedValue, onSelect }) {
    const [open, setOpen] = useState(false);
    const selected = items.find(i => i.value === selectedValue);

    return (
        <View style={{ margin: 5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ width: 110 }}>{label}</Text>
                <Pressable
                    onPress={() => setOpen(!open)}
                    style={{ flex: 1, borderWidth: 1, padding: 8, flexDirection: 'row', justifyContent: 'space-between' }}
                >
                    <Text>{selected ? selected.label : placeholder}</Text>
                    <Text>▼</Text>
                </Pressable>
            </View>
            {open && (
                <View style={{ borderWidth: 1, marginLeft: 110 }}>
                    {items.length === 0 ? (
                        <Text style={{ padding: 10 }}>Koi item nahi mila</Text>
                    ) : (
                        items.map(i => (
                            <Pressable
                                key={i.value}
                                style={{ padding: 10 }}
                                onPress={() => { onSelect(i.value); setOpen(false); }}
                            >
                                <Text>{i.label}</Text>
                            </Pressable>
                        ))
                    )}
                </View>
            )}
        </View>
    );
}