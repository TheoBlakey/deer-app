import { useCallback, useEffect, useState } from "react";
import { Link, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image, Modal, ActivityIndicator } from "react-native";

import { images } from "../../constants";
import CustomButton from '@/components/myComponents/CustomButton';
import FormField, { FieldInfo, Field, dropData } from "@/components/myComponents/FormField";
import { Collection, createAppWrite, deleteAppWrite, getCurrentUser, getDocumentByIdAppWrite, signIn, updateAppWrite } from "@/lib/appwrite";

import { useGlobalContext } from "../../context/GlobalProvider";

import { Species, Sex, Deer, createDefaultDeer, validateDeer, mapToDeer } from '@/objects/deerObjects';
import React from "react";
import CustomScreenWrapper from "@/components/myComponents/CustomScreenWrapper";

export default function DeerForm() {

    const { user, globalDeerId, setGlobalDeerId } = useGlobalContext();
    const [isSubmitting, setSubmitting] = useState(false);
    const [isDeleting, setDeleting] = useState(false);

    const [deerForm, setForm] = useState<Deer>(createDefaultDeer());

    const isUpdate = globalDeerId != "";
    const [deerFetchLoading, setDeerFetchLoading] = useState(false);

    const fetchDeer = async (deerid: string) => {

        setDeerFetchLoading(true);

        const deerDocument = await getDocumentByIdAppWrite(deerid, Collection.deer);
        console.log(deerDocument);
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
            return () => {
                setGlobalDeerId("");

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
        // { PropName: "dateTime", Field: Field.DateTime },
        // { PropName: "placeId", Field: Field.Drop },
        { PropName: "dateTime", Field: Field.Date, differentTitle: "Date" },
        { PropName: "dateTime", Field: Field.Time, differentTitle: "Time" },
        { PropName: "species", Field: Field.Drop, dropData: dropData(Object.values(Species)) },
        { PropName: "weight", Field: Field.Dec },
        { PropName: "age", Field: Field.Int },
        { PropName: "sex", Field: Field.Drop, dropData: dropData(Object.values(Sex)) },
        { PropName: "embryo", Field: Field.Tick, disabled: disableFemaleTraits },
        { PropName: "milk", Field: Field.Tick, disabled: disableFemaleTraits },
        { PropName: "comments", Field: Field.Text },
    ];





    const submit = async () => {

        const validationIssues = validateDeer(deerForm);
        if (validationIssues.length > 0) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setSubmitting(true);

        try {
            if (isUpdate) {
                console.log("ID:" + globalDeerId);
                console.log("Deer:" + JSON.stringify(deerForm));
                await updateAppWrite(globalDeerId, deerForm, Collection.deer)
            }
            else {
                await createAppWrite(deerForm, Collection.deer);
            }

            setModalExitVisible(true);

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

    const deerFormComponent = (
        <>
            <Text className="text-2xl font-semibold text-white font-psemibold">
                {!isUpdate ? "Add a new deer" : "Update Deer- Id:" + globalDeerId}
            </Text>

            {deerFieldInfo.map((fieldInfo, index) => (
                <FormField
                    key={index}
                    FieldInfo={fieldInfo}
                    Form={deerForm}
                    SetFormAbove={setForm}
                />
            ))}

            <CustomButton
                title={isUpdate ? "Update Deer" : "Submit Deer"}
                handlePress={submit}
                containerStyles={`mt-7 ${!isUpdate && "mb-7"}`}
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

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalExitVisible}
                onRequestClose={() => {
                    setModalExitVisible(false);
                    router.replace("/home");
                }}
            >
                <View className="flex-1 justify-center items-center mt-6">
                    <View className="m-5 bg-white rounded-2xl p-9 items-center shadow-lg">
                        <Text className="text-xl font-semibold">
                            Successful Operation, please click here to go home
                        </Text>
                        <CustomButton
                            title="Go to home"
                            handlePress={() => {
                                setModalExitVisible(false);
                                router.replace("/home");
                            }}
                            containerStyles="mt-7 w-40"
                        />
                    </View>
                </View>
            </Modal>
        </>
    );

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

        </CustomScreenWrapper>
    );
};