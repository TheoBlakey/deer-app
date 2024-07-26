import { useCallback, useEffect, useState } from "react";
import { Link, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";

import { images } from "../../constants";
import CustomButton from '@/components/myComponents/CustomButton';
import FormField, { FieldInfo, Field } from "@/components/myComponents/FormField";
import { Collection, createAppWrite, deleteAppWrite, getCurrentUser, getDocumentByIdAppWrite, getDocumentsByUserIdAppWrite, signIn, updateAppWrite } from "@/lib/appwrite";

import { useGlobalContext } from "../../context/GlobalProvider";

import React from "react";
import { Models } from "react-native-appwrite";
import CustomScreenWrapper from "@/components/myComponents/CustomScreenWrapper";

export default function DeerList() {

    const [deerDocumentList, setDeerDocumentList] = useState<Models.Document[]>([]);
    const [loadingDeer, setLoadingDeer,] = useState<boolean>(false);
    const { user, setGlobalDeerId, globalDeerId } = useGlobalContext();

    const fetchDeerList = async () => {
        setLoadingDeer(true);

        const deerDocuments = await getDocumentsByUserIdAppWrite(user?.$id ?? "", Collection.deer);
        setDeerDocumentList(deerDocuments);

        setLoadingDeer(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchDeerList();
            return () => {
                // Cleanup if needed when screen is unfocused
            };
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            // console.log("id now" + globalDeerId);
            if (globalDeerId != "") {
                router.push({
                    pathname: '/deerForm',
                    // params: { paramDeerId: globalDeerId }
                });

            }
            return () => {
                // Cleanup if needed when screen is unfocused
            };
        }, [globalDeerId])
    );


    // if (loadingDeer) {
    //     return (
    //         <SafeAreaView className="bg-primary h-full flex justify-center items-center">
    //             <ActivityIndicator size="large" color="#ffffff" />
    //             <Text className="text-white mt-4">Loading...</Text>
    //         </SafeAreaView>
    //     );
    // }

    const tableFields = [
        // { key: 'userId', label: 'User ID' },
        { key: 'dateTime', label: 'Date' },
        { key: 'species', label: 'Species' },
        { key: 'weight', label: 'Weight' },
        { key: 'age', label: 'Age' },
        { key: 'sex', label: 'Sex' },
        { key: 'embryo', label: 'Embryo' },
        { key: 'milk', label: 'Milk' },
        // { key: 'comments', label: 'Comments' }
    ];

    const tableHeadings = () => (
        <View className="flex-row border-b border-gray-300 pb-2.5">
            {tableFields.map((field) => (
                <View key={field.key} className="flex-1 items-center">
                    <Text className="text-white text-l font-psemibold">{field.label}</Text>
                </View>
            ))}
        </View>
    );


    const renderDeerRow = (deer: any) => (
        <TouchableOpacity
            onPress={() => {
                setGlobalDeerId(deer.$id)
            }}
            activeOpacity={0.2}
            className="flex-row border-b border-gray-300 py-2.5"
            key={deer.$id}
        >
            {tableFields.map((field) => (
                <View key={field.key} className="flex-1 items-center">
                    <Text className="text-white text-l font-psemibold">{getDisplay(deer[field.key])}</Text>
                </View>
            ))}
        </TouchableOpacity>
    );

    function isDateString(input: string): boolean {
        const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+\d{2}:\d{2}$/;
        return regex.test(input);
    }

    function getDisplay(deerField: any): string {

        if (deerField == null) {
            return "Empty";
        }

        if (typeof deerField === 'string') {

            if (!isDateString(deerField)) {
                return deerField;
            }

            deerField = new Date(deerField);

        }

        if (deerField instanceof Date) {
            const day = deerField.getDate().toString().padStart(2, '0');
            const month = (deerField.getMonth() + 1).toString().padStart(2, '0');
            const year = deerField.getFullYear().toString().slice(-2); // Get last 2 digits of the year
            return `${day}/${month}/${year}`;
        }


        if (typeof deerField === 'boolean') {
            return deerField ? "yes" : "no";
        }

        if (typeof deerField === 'number') {
            return deerField.toString();
        }

        return "Empty";
    }

    return (
        <CustomScreenWrapper>

            <Text className="text-2xl font-semibold text-white font-psemibold">
                Deer Records Table
            </Text>

            <View className="flex-1 items-center p-0.5 mt-10">
                {tableHeadings()}
                {loadingDeer ? (
                    <View className="mt-10">
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text className="text-white mt-4 text-xl font-bold" >Loading...</Text>
                    </View >

                ) : (
                    <>
                        {deerDocumentList.map((item: any) => renderDeerRow(item))}
                    </>
                )}
            </View>

        </CustomScreenWrapper>
    );

};
