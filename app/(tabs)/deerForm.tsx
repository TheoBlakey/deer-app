import { useCallback, useEffect, useRef, useState } from "react";
import { Link, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image, Modal, ActivityIndicator } from "react-native";

import { images } from "../../constants";
import CustomButton from '@/components/myComponents/CustomButton';
import FormField, { FieldInfo, Field, dropData, dropDataPlaceDocument, RuleNotNull, FormFieldRef, Rule0to15, Rule0to200 } from "@/components/myComponents/FormField";
import { Collection, createAppWrite, deleteAppWrite, getCurrentUser, getDocumentByIdAppWrite, getDocumentsByUserIdAppWrite, signIn, updateAppWrite } from "@/lib/appwrite";

import { useGlobalContext } from "../../context/GlobalProvider";

import { Species, Sex, Deer, createDefaultDeer, mapToDeer, deerDisplayName, Destination, Place } from '@/objects/deerObjects';
import React from "react";
import CustomScreenWrapper from "@/components/myComponents/CustomScreenWrapper";
import { Models } from "react-native-appwrite";
import { allFieldsPassValidation, resetAllValidation } from "@/lib/validationFunctions";
import CustomModal from "@/components/myComponents/CustomModal";

export default function DeerForm() {

    const { user, globalDeerId, setGlobalDeerId } = useGlobalContext();
    const [isSubmitting, setSubmitting] = useState(false);
    const [isDeleting, setDeleting] = useState(false);

    const [deerForm, setForm] = useState<Deer>(createDefaultDeer());

    const isUpdate = globalDeerId != "";
    const [deerFetchLoading, setDeerFetchLoading] = useState(false);


    const [placeDocumentList, setPlaceDocumentList] = useState<Models.Document[]>([]);
    const fetchPlaceList = async () => {
        const placeDocuments = await getDocumentsByUserIdAppWrite(user?.$id ?? "", Collection.place);
        setPlaceDocumentList(placeDocuments);
    };

    const fetchDeer = async (deerid: string) => {

        setDeerFetchLoading(true);

        const deerDocument = await getDocumentByIdAppWrite(deerid, Collection.deer);

        const deerObj = mapToDeer(deerDocument);

        setForm(deerObj);

        setDeerFetchLoading(false);
    };

    useFocusEffect(
        useCallback(() => {

            if (globalDeerId != "") {
                fetchDeer(globalDeerId);
            }
            else {
                setForm(createDefaultDeer())
                setForm(prevForm => ({ ...prevForm, userId: user?.$id ?? null }));
            }

        }, [globalDeerId]))


    useFocusEffect(
        useCallback(() => {
            fetchPlaceList();
            return () => {
                setGlobalDeerId("");
                resetAllValidation(refList);
            };
        }, []))


    useEffect(() => {
        switch (deerForm.sex) {
            case Sex.Male:
                setForm(prevForm => ({
                    ...prevForm,
                    embryo: null,
                    milk: null
                }));
                break;
            case Sex.Female:
                setForm(prevForm => ({
                    ...prevForm,
                    embryo: deerForm.embryo == null ? false : deerForm.embryo,
                    milk: deerForm.milk == null ? false : deerForm.milk,
                }));
                break;
        }
    }, [deerForm.sex]);

    var disableFemaleTraits: boolean = deerForm.sex == Sex.Male;

    let deerFieldInfo: FieldInfo[] = [

        { PropName: "dateTime", Field: Field.Date, differentTitle: "Date" },
        { PropName: "dateTime", Field: Field.Time, differentTitle: "Time" },
        { PropName: "species", Field: Field.Drop, dropData: dropData(Object.values(Species)), ValidationRules: [RuleNotNull] },
        { PropName: "weight", Field: Field.Dec, ValidationRules: [RuleNotNull, Rule0to200] },
        { PropName: "age", Field: Field.Int, ValidationRules: [RuleNotNull, Rule0to15] },
        { PropName: "sex", Field: Field.Drop, dropData: dropData(Object.values(Sex)), ValidationRules: [RuleNotNull] },
        { PropName: "embryo", Field: Field.Tick, disabled: disableFemaleTraits },
        { PropName: "milk", Field: Field.Tick, disabled: disableFemaleTraits },
        { PropName: "destination", Field: Field.Drop, dropData: dropData(Object.values(Destination)) },
        { PropName: "place", Field: Field.Drop, dropData: dropDataPlaceDocument(placeDocumentList) },
        { PropName: "comments", Field: Field.Text },
    ];


    const submit = async () => {


        if (!allFieldsPassValidation(refList)) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }


        setSubmitting(true);

        try {
            if (isUpdate) {

                await updateAppWrite(globalDeerId, deerForm, Collection.deer)
            }
            else {
                const deerCopy = { ...deerForm };
                if (deerForm.place != null) {
                    deerCopy.place = deerForm.place.$id as unknown as Place;
                }
                await createAppWrite(deerCopy, Collection.deer);
            }

            customModalRef.current.openModal();

        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const modalDeleteYes = async () => {
        try {
            setDeleting(true);
            await deleteDeer();
            setModalExitVisible(true);
        } catch (error) {
            console.error('Error deleting deer:', error);
        } finally {
            setDeleting(false);
            setModalDeleteVisible(false);
        }
    }
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [modalExitVisible, setModalExitVisible] = useState(false);

    const deleteDeer = async () => {
        setDeleting(true);
        try {
            await deleteAppWrite(globalDeerId, Collection.deer)
            setModalExitVisible(true);

        } catch (error: any) {
            Alert.alert("Error", error.message);
            throw error;
        }

    };

    const refList: (any)[] = [];

    const deerFormComponent = (
        <>
            <Text className={`text-2xl font-semibold text-white font-psemibold`}>
                {!isUpdate ? "Add A New Deer" : `Update Deer -`}
            </Text>

            {isUpdate ? (
                <Text className="text-2xl font-semibold font-psemibold text-secondary">
                    {`Id: ${globalDeerId}`}
                </Text>
            ) : null}

            <View className="flex-row border-b border-gray-300 pb-2.5 mb-5" />

            {deerFieldInfo.map((fieldInfo, index) => {
                if (fieldInfo.differentTitle == null) {
                    fieldInfo.differentTitle = deerDisplayName(fieldInfo.PropName);
                }
                refList[index] = useRef();
                return (
                    <FormField
                        key={index + fieldInfo.PropName}
                        FieldInfo={fieldInfo}
                        Form={deerForm}
                        SetFormAbove={setForm}
                        ref={refList[index]}
                    />
                );
            })}

            <CustomButton
                title={isUpdate ? "Update Deer" : "Submit Deer"}
                handlePress={submit}
                containerStyles={`mt-5 ${!isUpdate && "mb-7"}`}
                isLoading={isSubmitting}
            />

            {isUpdate && (
                <CustomButton
                    title="Delete Deer"
                    handlePress={() => setModalDeleteVisible(true)}
                    containerStyles="mt-7 mb-7 bg-myRed"
                    isLoading={isDeleting}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalDeleteVisible}
                onRequestClose={() => {
                    setModalDeleteVisible(false);
                }}
            >
                <View className="flex-1 justify-center items-center mt-6">
                    <View className="m-5 bg-white rounded-2xl p-9 items-center shadow-lg">
                        <Text className="text-xl font-semibold">
                            Are you sure you want to delete this deer?
                        </Text>
                        <CustomButton
                            title="Yes"
                            handlePress={modalDeleteYes}
                            containerStyles="mt-7  w-40"
                            isLoading={isDeleting}
                        />
                        <CustomButton
                            title="No"
                            handlePress={() => setModalDeleteVisible(false)}
                            containerStyles="mt-7  w-40"
                        />
                    </View>
                </View>
            </Modal>
        </>
    );

    const customModalRef = useRef() as any
    return (
        <CustomScreenWrapper>

            <>
                {deerFetchLoading ? (
                    <View className="flex-1 justify-center items-center mt-60">
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text className="text-white mt-4 text-xl font-bold">Loading...</Text>
                    </View>


                ) : (
                    deerFormComponent
                )}
            </>
            <CustomModal ref={customModalRef}></CustomModal>
        </CustomScreenWrapper>
    );
};