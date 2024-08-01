import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Switch } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

// import DropDownPicker from 'react-native-dropdown-picker';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';

import { icons } from "../../constants";

interface FormFieldProps {
    FieldInfo: FieldInfo;
    Form: Object;
    SetFormAbove: (form: any) => void;
}

export interface DropData {
    label: string
    value: any
}

export interface FieldInfo {
    PropName: string;
    Field: Field;
    differentTitle?: string;
    disabled?: boolean;
    dropData?: DropData[];
    placeholder?: string;
    otherStyles?: string;
}

export enum Field {
    Text = "Text",
    Date = "Date",
    Time = "Time",
    Dec = "Dec",
    Int = "Int",
    Drop = "Drop",
    Tick = "Tick"
}

export default function FormField({ FieldInfo, Form, SetFormAbove }: FormFieldProps) {

    var title = FieldInfo.differentTitle != null ? FieldInfo.differentTitle : capitalizeFirstLetter(FieldInfo.PropName);
    title = title + ":"
    const value = (Form as any)[FieldInfo.PropName];

    const handleChange = (e: any) => {
        const newForm = { ...Form }; // Create a copy of form object
        (newForm as any)[FieldInfo.PropName] = e; // Update the specific field
        SetFormAbove(newForm); // Set the updated form object using setForm
    };

    const nextToField = [Field.Tick, Field.Int, Field.Dec, Field.Drop, Field.Date, Field.Time].includes(FieldInfo.Field)
    // const nextToField = false;
    let picker = null;
    switch (FieldInfo.Field) {

        case Field.Date:
        case Field.Time:
            const isDate = FieldInfo.Field == Field.Date;

            const onChange = (event: { type: string; nativeEvent: { timestamp: number; utcOffset?: number } }, selectedDate: Date | undefined) => {
                const { type, nativeEvent } = event;

                if (type === 'set') {
                    const chosenDateTime = new Date(nativeEvent.timestamp) || value;

                    if (isDate) {
                        var combinedDate = new Date(chosenDateTime.getFullYear(), chosenDateTime.getMonth(), chosenDateTime.getDate(), value.getHours(), value.getMinutes());

                    } else {
                        combinedDate = new Date(value.getFullYear(), value.getMonth(), value.getDate(), chosenDateTime.getHours(), chosenDateTime.getMinutes());
                    }

                    handleChange(combinedDate);
                }

                setShow(false);
            };

            const [show, setShow] = useState(false);



            if (isDate) {
                var displayDateTime = (value as unknown as Date).toDateString();

            } else {
                const hours = value.getHours().toString().padStart(2, '0');
                const minutes = value.getMinutes().toString().padStart(2, '0');
                displayDateTime = hours + ":" + minutes;
            }


            picker = (
                <>
                    <TouchableOpacity
                        onPress={() => setShow(true)}
                        activeOpacity={0.7}
                        className={`w-60 h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row items-center ${show ? 'border-secondary' : ''}`}
                    >
                        <Text className="text-white text-lg flex flex-row">
                            {displayDateTime}
                        </Text>
                    </TouchableOpacity>

                    {show && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={value}
                            mode={isDate ? "date" : "time"}
                            is24Hour={true}
                            display="default"
                            onChange={onChange}
                        />
                    )}
                </>
            );

            break;

        case Field.Text:
            const [showPassword, setShowPassword] = useState(false);

            picker = (
                <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
                    <TextInput
                        className="flex-1 text-white font-psemibold text-base"
                        value={value != null ? value.toString() : ''}
                        placeholder={FieldInfo.placeholder}
                        placeholderTextColor="#7B7B8B"
                        onChangeText={handleChange}
                        secureTextEntry={title === 'Password' && !showPassword}
                    />

                    {title === 'Password' && (
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Image
                                source={!showPassword ? icons.eye : icons.eyeHide}
                                className="w-6 h-6"
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            );
            break;

        case Field.Dec:

            const [decStringValue, setdecStringValue] = useState<string>(value != null ? value.toString() : '');

            useEffect(() => {
                setdecStringValue(value != null ? value.toString() : '');
            }, [value]);

            const handleChangeDec = (e: string) => {

                if (e == "" || e == null) {
                    handleChange(null);
                    setdecStringValue("");
                    return;
                }

                var validDecimal = e.match(/^\d{1,}(\.\d{0,4})?$/);
                var float = parseFloat(e)
                const outOfRange = 150 < float

                var tooMnayDecimalPlace = false;
                if (e.includes('.')) {
                    tooMnayDecimalPlace = 2 < e.split('.')[1].length;
                }
                if (!validDecimal || outOfRange || tooMnayDecimalPlace) {
                    return;
                }

                setdecStringValue(e);
                if (!isNaN(float)) {
                    handleChange(float);
                }
            };

            picker = (
                <View className="w-20 h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
                    <TextInput
                        className="flex-1 text-white font-psemibold text-base"
                        value={decStringValue}
                        onChangeText={handleChangeDec}
                        keyboardType="decimal-pad"
                    />
                </View>
            );
            break;

        case Field.Drop:

            const [enabled, SetEnabled] = useState(true);
            picker = (
                <View className="w-60 h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center" >
                    <Picker
                        selectedValue={value}
                        style={{ flex: 1, color: 'white' }}
                        dropdownIconColor="white"
                        onValueChange={handleChange}
                        onBlur={() => SetEnabled(true)}
                        onFocus={() => SetEnabled(false)}
                    >
                        <Picker.Item label="Please pick an option:" value={null} enabled={true} color={"grey"} />
                        {FieldInfo.dropData != null &&
                            FieldInfo.dropData.map((option, index) => (
                                <Picker.Item key={index} label={option.label} value={option.value} />
                                //enabled={option.value == value}
                            ))}


                    </Picker>
                </View>
            )

            break;

        case Field.Int:

            const handleChangeInt = (e: any) => {

                if (e == "" || e == null) {
                    handleChange(e);
                    return;
                }
                var validInt = e.match(/^\d+$/);
                var float = parseFloat(e);
                const outOfRange = float < 0 || 100 < float
                if (!validInt || outOfRange) {
                    return;
                }

                handleChange(float);
            };

            picker = (
                <View className="w-20 h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
                    <TextInput
                        className="flex-1 text-white font-psemibold text-base"
                        value={value != null ? value.toString() : ''}
                        onChangeText={handleChangeInt}
                        keyboardType="numeric"
                    />
                </View>
            );
            break;

        case Field.Tick:

            picker = (

                <View className="w-16 h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center justify-center">
                    {FieldInfo.disabled ? (
                        <Text
                            className="flex-1 font-psemibold text-base"
                            style={{ color: 'grey' }}
                        >
                            N/A
                        </Text>
                    ) : (
                        <Checkbox
                            disabled={FieldInfo.disabled}
                            className="w-9 h-9"
                            value={value != null ? value : false}
                            onValueChange={handleChange}
                            color='#4630EB'
                        />
                    )}
                </View>

            );
            break;

        default:
            break;
    }

    return (
        nextToField ? (
            <View className={`space-y-2 mt-7 ${FieldInfo.otherStyles}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text className="flex-1 text-white text-base font-pmedium">{title}</Text>
                {picker}
            </View>
        ) : (
            <View className={`space-y-2 mt-7 ${FieldInfo.otherStyles}`}>
                <Text className="text-white text-base font-pmedium">{title}</Text>
                {picker}
            </View>
        )
    );
}





function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function dropData(values: string[]): DropData[] {
    return values.map(value => ({
        label: value,
        value: value
    }));
}

