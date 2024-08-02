import { useCallback, useEffect, useState } from "react";
import { Link, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";

import { images } from "../../constants";
import CustomButton from '@/components/myComponents/CustomButton';
import FormField, { FieldInfo, Field, dropData } from "@/components/myComponents/FormField";
import { Collection, createAppWrite, deleteAppWrite, getCurrentUser, getDocumentByIdAppWrite, getDocumentsByQuery, getDocumentsByUserIdAppWrite, signIn, updateAppWrite } from "@/lib/appwrite";

import { useGlobalContext } from "../../context/GlobalProvider";

import React from "react";
import { Models, Query } from "react-native-appwrite";
import CustomScreenWrapper from "@/components/myComponents/CustomScreenWrapper";
import { exportDeerCSV, exportDeerPDF } from "@/lib/fileExporter";
import { Deer, mapToDeerList, Sex, Species } from "@/objects/deerObjects";

export default function DeerList() {

    const [deerDocumentList, setDeerDocumentList] = useState<Models.Document[]>([]);
    const [loadingDeer, setLoadingDeer,] = useState<boolean>(false);
    const { user, setGlobalDeerId } = useGlobalContext();

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
                setDeerSearchForm(defaultSearch);
                setViewFilters(false);
            };
        }, [])
    );

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
                setGlobalDeerId(deer.$id);
                router.push({ pathname: '/deerForm' });
            }}
            activeOpacity={0.2}
            className="flex-row border-b border-gray-300 py-4"
            key={deer.$id}
        >
            {tableFields.map((field) => (
                <View key={field.key} className="flex-1 items-center">
                    <Text className="text-white text-l font-bold">{getDisplay(deer[field.key])}</Text>
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





    const deerTable = () => (

        <View className="flex-1 items-center p-0.5 mt-5">
            {tableHeadings()}
            {loadingDeer ? (
                <View className="mt-10">
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text className="text-white mt-4 text-xl font-bold" >Loading...</Text>
                </View >

            ) : (
                <>
                    {deerDocumentList.map((item: any) => renderDeerRow(item))}
                    <CustomButton
                        title="Export Table as Excel File"
                        handlePress={() => exportDeerCSV(mapToDeerList(deerDocumentList))}
                        containerStyles="mt-7 w-full"
                    />

                    <CustomButton
                        title="Export Table as PDF"
                        handlePress={() => exportDeerPDF(mapToDeerList(deerDocumentList))}
                        containerStyles="mt-7 mb-7 w-full"
                    />
                </>
            )}
        </View>
    );

    interface DeerSearch {
        dateTimeStart: Date;
        dateTimeEnd: Date;
        species: Species | null;
        // weight: number | null;
        // age: number | null;
        sex: Sex | null;
        embryo: boolean | null;
        milk: boolean | null;
    }
    const defaultSearch: DeerSearch = {
        dateTimeStart: new Date('2020-01-01'),
        dateTimeEnd: new Date(),
        species: null,
        sex: null,
        embryo: null,
        milk: null
    };

    const [deerSearchForm, setDeerSearchForm] = useState<DeerSearch>(defaultSearch);
    const [viewFilters, setViewFilters] = useState(false);

    let searchFieldInfo: FieldInfo[] = [
        { PropName: "dateTimeStart", Field: Field.Date, differentTitle: "From Date" },
        { PropName: "dateTimeEnd", Field: Field.Date, differentTitle: "To Date" },
        { PropName: "species", Field: Field.Drop, dropData: dropData(Object.values(Species)) },
        { PropName: "sex", Field: Field.Drop, dropData: dropData(Object.values(Sex)) },
        { PropName: "embryo", Field: Field.Drop, dropData: [{ label: "Yes", value: true }, { label: "No", value: false }] },
        { PropName: "milk", Field: Field.Drop, dropData: [{ label: "Yes", value: true }, { label: "No", value: false }] }
    ];

    const fetchFilteredDeerList = async () => {
        setLoadingDeer(true);

        const queryList: string[] = [];
        queryList.push(Query.equal("userId", user?.$id ?? ""));
        queryList.push(Query.between('dateTime', (deerSearchForm.dateTimeStart).toDateString(), (deerSearchForm.dateTimeEnd).toDateString()));


        if (deerSearchForm.species != null) {
            queryList.push(Query.equal("species", deerSearchForm.species))
        }
        if (deerSearchForm.sex != null) {
            queryList.push(Query.equal("sex", deerSearchForm.sex))
        }
        if (deerSearchForm.embryo != null) {
            queryList.push(Query.equal("embryo", deerSearchForm.embryo))
        }
        if (deerSearchForm.milk != null) {
            queryList.push(Query.equal("milk", deerSearchForm.milk))
        }


        const deerDocuments = await getDocumentsByQuery(queryList, Collection.deer);
        setDeerDocumentList(deerDocuments);

        setLoadingDeer(false);
    };

    const filterForm = () => (
        <>
            <View className="flex-row border-b border-gray-300 pb-2.5" />

            {searchFieldInfo.map((fieldInfo, index) => (
                <FormField
                    key={index}
                    FieldInfo={fieldInfo}
                    Form={deerSearchForm}
                    SetFormAbove={setDeerSearchForm}
                />
            ))}


            <CustomButton
                title="Apply Filter"
                handlePress={() => {
                    setViewFilters(false);
                    setDeerSearchForm(defaultSearch);
                    fetchFilteredDeerList();
                }}
                containerStyles="mt-7"
            />
            <CustomButton
                title="Cancel Filter"
                handlePress={() => {
                    setViewFilters(false);
                    setDeerSearchForm(defaultSearch);
                    fetchDeerList();
                    console.log(user)
                }}
                containerStyles="mt-7"
            />

        </>



    );

    return (
        <CustomScreenWrapper>

            <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-semibold text-white font-psemibold mt-3">
                    Deer Records Table
                </Text>
                <CustomButton
                    title="Filter Table"
                    handlePress={() => {
                        if (viewFilters) {
                            setDeerSearchForm(defaultSearch);
                        }
                        setViewFilters(!viewFilters);
                    }}
                    containerStyles="7 h-2 w-20"
                    textStyles="text-l"
                />
            </View>


            {viewFilters ? filterForm() : deerTable()}

        </CustomScreenWrapper>
    );

};
