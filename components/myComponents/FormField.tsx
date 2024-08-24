import React, { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Switch, Platform } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';



import Checkbox from 'expo-checkbox';

import { icons } from "../../constants";
import { Models } from "react-native-appwrite";
import { SelectList } from 'react-native-dropdown-select-list';


interface FormFieldProps {
    FieldInfo: FieldInfo;
    Form: Object;
    SetFormAbove: (form: any) => void;
    ListIndex?: Number
}

interface ValidationRule {
    failMessage: string
    passValidation: (value: any) => boolean
}


export interface FieldInfo {
    PropName: string;
    Field: Field;
    differentTitle?: string;
    disabled?: boolean;
    dropData?: { value: string; doc: any; }[];
    placeholder?: string;
    otherStyles?: string;
    ValidationRules?: ValidationRule[];
    smallTextBox?: boolean;
}

export interface FormFieldRef {
    checkValidation: () => boolean;
}

export enum Field { Text = "Text", Date = "Date", Time = "Time", Dec = "Dec", Int = "Int", Drop = "Drop", Tick = "Tick" }

export const RuleNotNull: ValidationRule = {
    failMessage: "Field Cannot Be Empty",
    passValidation: (value: any) => value !== null && value !== undefined && value !== ''
};

export const Rule0to15: ValidationRule = {
    failMessage: "Field must be less than 15",
    passValidation: (value: any) => {
        if (value === null || value === undefined || value === '') {
            return false;
        }
        const numericValue = Number(value);
        return !isNaN(numericValue) && numericValue < 15;
    }
};

export const Rule0to200: ValidationRule = {
    failMessage: "Field must be more than zero and less than 200",
    passValidation: (value: any) => {
        if (value === null || value === undefined || value === '') {
            return false;
        }
        const numericValue = Number(value);
        return !isNaN(numericValue) && numericValue > 0 && numericValue < 200;
    }
};



const FormField = forwardRef<any, FormFieldProps>(({ FieldInfo, Form, SetFormAbove, ListIndex }, ref) => {

    if (ref != undefined) {
        useImperativeHandle(ref, () => ({
            // triggerFunction() {
            //     alert('Function in Child Component triggered!');
            // },
            hasPassedValidation,
            resetValidation
        }));
    }

    const [validationFailMessages, setValidationFailMessages] = useState<string[]>([]);

    function hasPassedValidation(input = value): boolean {
        if (FieldInfo.ValidationRules == undefined) {
            return true;
        }

        var passedValidation = true;
        var newDisplayProblems: string[] = [];

        FieldInfo.ValidationRules.forEach(Rule => {

            if (!Rule.passValidation(input)) {
                passedValidation = false;
                newDisplayProblems.push(Rule.failMessage)
            }
        });

        setValidationFailMessages(newDisplayProblems);
        return passedValidation;
    }

    function resetValidation() {
        setValidationFailMessages([]);
    }



    var title = FieldInfo.differentTitle != null ? FieldInfo.differentTitle : capitalizeFirstLetter(FieldInfo.PropName);
    title = title + ":"

    var formObject = {};
    if (ListIndex != undefined && ListIndex != null) {
        const formArray = Form as [];
        formObject = formArray[ListIndex as number];
    } else {
        formObject = Form;
    }
    const value = (formObject as any)[FieldInfo.PropName];




    const handleChange = (e: any) => {
        hasPassedValidation(e);

        if (ListIndex != undefined && ListIndex != null) {

            const newList = [...Form as []];
            const newListItem = newList[ListIndex as number];
            (newListItem as any)[FieldInfo.PropName] = e;

            newList[ListIndex as number] = newListItem;
            SetFormAbove(newList); // Set the updated form object using setForm

        } else {

            const newForm = { ...Form }; // Create a copy of form object
            (newForm as any)[FieldInfo.PropName] = e; // Update the specific field
            SetFormAbove(newForm); // Set the updated form object using setForm

        }

    };

    var nextToField = [Field.Tick, Field.Int, Field.Dec, Field.Drop, Field.Date, Field.Time].includes(FieldInfo.Field)


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
                    {(Platform.OS !== 'ios') && (
                        <TouchableOpacity
                            onPress={() => setShow(true)}
                            activeOpacity={0.7}
                            className={`w-60 h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row items-center ${show ? 'border-secondary' : ''}`}
                        >
                            <Text className="text-white text-lg flex flex-row">
                                {displayDateTime}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {(show || Platform.OS === 'ios') && (
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
                //w-full
                <View
                    className="h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center"
                    style={FieldInfo.smallTextBox ? { width: 252 } : {}}
                >
                    <TextInput
                        className="flex-1 text-white font-psemibold text-base"
                        value={value != null ? value.toString() : ''}
                        placeholder={FieldInfo.placeholder}
                        placeholderTextColor="#7B7B8B"
                        onChangeText={handleChange}
                        secureTextEntry={FieldInfo.PropName === 'password' && !showPassword}
                    />

                    {FieldInfo.PropName === 'password' && (
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


            const [isDropdownOpen, setIsDropdownOpen] = useState(false);
            const [isDropDownPaused, setIsDropDownPaused] = useState(false);

            function dropDownClicked() {

                if (isDropdownOpen) {
                    closeDropDown()
                }
                else if (!isDropDownPaused) {
                    setIsDropdownOpen(true);
                }
            }

            function closeDropDown() {
                setIsDropdownOpen(false);
                setIsDropDownPaused(true);
                setTimeout(() => {
                    setIsDropDownPaused(false);
                }, 500); // 500 milliseconds = 0.5 seconds
            }


            function displayText() {
                if (!FieldInfo.dropData || value == null) {
                    return "Select an option"
                }

                var foundItem = FieldInfo.dropData.find(item => item.doc === value);

                if (foundItem == null) {
                    foundItem = FieldInfo.dropData.find(item => item.doc.$id === value.$id);
                }

                return foundItem?.value;

            }

            function handleDropChange(e: any) {

                if (!FieldInfo.dropData) {
                    return
                }

                const foundItem = FieldInfo.dropData.find(item => item.value === e);
                handleChange(foundItem?.doc)
            }

            picker = (
                <View className={`w-60 h-16 px-4 bg-black-100 rounded-2xl border-2 flex-row ${isDropdownOpen ? 'border-secondary z-10' : 'border-black-200'}`} >
                    <View className=" flex-row items-center ">
                        <Text className="text-white text-lg flex flex-row ">{displayText()}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={dropDownClicked}
                        style={{
                            position: 'absolute',
                            borderWidth: 0, //have a look at 2
                            borderColor: 'blue',
                            padding: 10,
                            borderRadius: 5,
                            width: 240,
                            // height: 64
                            // marginBottom: 10,
                        }}
                    >


                        <SelectList
                            defaultOption={value}
                            setSelected={handleDropChange}
                            data={(FieldInfo.dropData ? FieldInfo.dropData : [])}
                            // placeholder="Select an option"
                            search={false}
                            dropdownStyles={{
                                backgroundColor: '#fafafa',
                                // zIndex: isDropdownOpen ? 10 : 0, // Apply zIndex based on dropdown state
                                display: isDropdownOpen ? "flex" : "none"
                            }}
                            inputStyles={{
                                color: 'white',
                                opacity: 0
                                // display: 'none'
                            }}

                            boxStyles={{
                                pointerEvents: 'none', // Prevent interaction when dropdown is closed
                                borderWidth: 0,
                                // display: "none",
                                // paddingTop: 70
                            }}
                            onSelect={closeDropDown}
                            dropdownShown={isDropdownOpen}
                            maxHeight={1000}
                        />
                    </TouchableOpacity>
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

            const [focused, SetFocused] = useState(false);
            picker = (


                <View className={`w-16 h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex flex-row items-center justify-center ${focused && "border-secondary"}`}>
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
                            onTouchStart={() => SetFocused(true)}
                            onTouchCancel={() => SetFocused(false)}
                            onTouchEnd={() => SetFocused(false)}
                        />
                    )}
                </View>

            );
            break;

        default:
            break;
    }

    return (
        <>
            {nextToField ? (
                <View className={`mt-1 flex-row items-center ${FieldInfo.otherStyles}`}>
                    <Text className="flex-1 text-white text-base font-pmedium">{title}</Text>
                    {picker}
                </View>
            ) : (
                <View className={`space-y-2 mt-1 ${FieldInfo.otherStyles}`}>
                    <Text className="text-white text-base font-pmedium">{title}</Text>
                    {picker}
                </View>
            )}

            {/* {validationFailMessages.map((failMessage, index) =>

                <View key={index} className="flex-row justify-end pt-2 pr-5">
                    <Text className="text-myRed text-base font-pmedium">
                        {failMessage}
                    </Text>
                </View>

            )} */}
            <View className="flex-row justify-end mb-2 mb-1 pr-5">
                <Text className="text-myRed text-base font-pmedium">
                    {validationFailMessages[0]}
                </Text>
            </View>
        </>
    );
}
)

export default FormField;



function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function dropData(values: string[]) {
    return values.map(value => ({
        doc: value,
        value: value
    }));
}

export function dropDataPlaceDocument(places: Models.Document[]) {

    // values.forEach(element => {

    // });
    return places.map(place => ({
        doc: place,
        value: String(place.name)
    }));
}


