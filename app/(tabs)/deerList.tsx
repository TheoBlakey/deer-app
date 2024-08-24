import { useCallback, useEffect, useState } from "react";
import { Link, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";

import { images } from "../../constants";
import CustomButton from '@/components/myComponents/CustomButton';
import FormField, { FieldInfo, Field, dropData, dropDataPlaceDocument } from "@/components/myComponents/FormField";
import { Collection, createAppWrite, deleteAppWrite, getCurrentUser, getDocumentByIdAppWrite, getDocumentsByQuery, getDocumentsByUserIdAppWrite, signIn, updateAppWrite } from "@/lib/appwrite";

import { useGlobalContext } from "../../context/GlobalProvider";

import React from "react";
import { Models, Query } from "react-native-appwrite";
import CustomScreenWrapper from "@/components/myComponents/CustomScreenWrapper";
import { exportDeerCSV, exportDeerPDF } from "@/lib/fileExporter";
import { Deer, deerDisplayName, deerPrint, mapToDeerList, Place, Sex, Species } from "@/objects/deerObjects";

export default function DeerList() {

    const [deerDocumentList, setDeerDocumentList] = useState<Models.Document[]>([]);
    const [loadingDeer, setLoadingDeer,] = useState<boolean>(false);
    const { user, setGlobalDeerId } = useGlobalContext();


    const fetchData = async () => {
        setLoadingDeer(true);

        const placeDocuments = await getDocumentsByUserIdAppWrite(user?.$id ?? "", Collection.place);
        setPlaceDocumentList(placeDocuments);
        const deerDocuments = await getDocumentsByUserIdAppWrite(user?.$id ?? "", Collection.deer);
        setDeerDocumentList(deerDocuments);

        setLoadingDeer(false);
    };

    const [placeDocumentList, setPlaceDocumentList] = useState<Models.Document[]>([]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
            return () => {
                setDeerSearchForm(defaultSearch);
                setViewFilters(false);
            };
        }, [])
    );


    const tableColumns = ["dateTime", "species", "weight", "age", "sex"];

    const tableHeadings = () => (
        <View className="flex-row border-b border-gray-300 pb-2.5">
            {tableColumns.map((column) => (
                <View key={column + "h"} className="flex-1 items-center">
                    <Text className="text-white text-l font-psemibold">{deerDisplayName(column)}</Text>
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
            {tableColumns.map((column) => (
                <View key={column + "r"} className="flex-1 items-center">
                    <Text className="text-white text-l font-bold">{deerPrint(column, deer[column])}</Text>
                </View>
            ))}
        </TouchableOpacity>
    );



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

                    {deerDocumentList.length === 0 ? (
                        <Text className="text-xl font-semibold text-white font-psemibold mt-5 text-center">
                            No records found. Please add a new record or change search criteria.
                        </Text>
                    ) : (
                        <>
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
                </>
            )}
        </View>
    );

    interface DeerSearch {
        dateTimeStart: Date;
        dateTimeEnd: Date;
        species: Species | null;
        sex: Sex | null;
        place: Place | null;
    }
    const defaultSearch: DeerSearch = {
        dateTimeStart: new Date('2020-01-01'),
        dateTimeEnd: new Date(),
        species: null,
        sex: null,
        place: null
    };

    const [deerSearchForm, setDeerSearchForm] = useState<DeerSearch>(defaultSearch);
    const [viewFilters, setViewFilters] = useState(false);

    let searchFieldInfo: FieldInfo[] = [
        { PropName: "dateTimeStart", Field: Field.Date, differentTitle: "From Date", otherStyles: "mt-5" },
        { PropName: "dateTimeEnd", Field: Field.Date, differentTitle: "To Date" },
        { PropName: "species", Field: Field.Drop, dropData: dropData(Object.values(Species)) },
        { PropName: "sex", Field: Field.Drop, dropData: dropData(Object.values(Sex)) },
        { PropName: "place", Field: Field.Drop, dropData: dropDataPlaceDocument(placeDocumentList) }
        // { PropName: "embryo", Field: Field.Drop, dropData: [{ label: "Yes", value: true }, { label: "No", value: false }] },
        // { PropName: "milk", Field: Field.Drop, dropData: [{ label: "Yes", value: true }, { label: "No", value: false }] }
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
        if (deerSearchForm.place != null) {
            queryList.push(Query.equal("place", deerSearchForm.place.$id))
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
                    fetchData();
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
                    title={viewFilters ? "Close Filter" : "Filter Tabler"}
                    handlePress={() => {
                        if (viewFilters) {
                            setDeerSearchForm(defaultSearch);
                        }
                        setViewFilters(!viewFilters);
                    }}
                    containerStyles="h-2 w-20"
                    textStyles="text-l"
                />
            </View>


            {viewFilters ? filterForm() : deerTable()}

        </CustomScreenWrapper>
    );

};
