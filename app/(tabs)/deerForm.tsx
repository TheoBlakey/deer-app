import { useCallback, useEffect, useState } from "react";
import { Link, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image, Modal } from "react-native";

import { images } from "../../constants";
import CustomButton from '@/components/myComponents/CustomButton';
import FormField, { FieldInfo, Field, dropData } from "@/components/myComponents/FormField";
import { Collection, createAppWrite, deleteAppWrite, getCurrentUser, getDocumentByIdAppWrite, signIn, updateAppWrite } from "@/lib/appwrite";

import { useGlobalContext } from "../../context/GlobalProvider";

import { Species, Sex, Deer, createDefaultDeer, validateDeer } from '@/objects/deerObjects';
import React from "react";
import CustomScreenWrapper from "@/components/myComponents/CustomScreenWrapper";

export default function DeerForm() {

    const { user } = useGlobalContext();
    const [isSubmitting, setSubmitting] = useState(false);
    const [isDeleting, setDeleting] = useState(false);

    const [deerForm, setForm] = useState<Deer>(createDefaultDeer());
    // const { paramDeerId } = useLocalSearchParams();

    const [isUpdate, setIsUpdate] = useState(false);
    const [updateDeerId, setUpdateDeerId] = useState("");

    const fetchDeer = async () => {
        if (isUpdate) {
            const deerDocument = await getDocumentByIdAppWrite(updateDeerId, Collection.deer);
            const deerObj = deerDocument as unknown as Deer;
            setForm(deerObj);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const paramDeerId = useLocalSearchParams();
            const updateDeerId = typeof paramDeerId === 'string' ? paramDeerId : "";

            setUpdateDeerId(updateDeerId);
            setIsUpdate(updateDeerId != "");

            if (isUpdate) {
                fetchDeer();
            }
            else {
                setForm(createDefaultDeer())
                setForm(prevForm => ({ ...prevForm, userId: user?.$id ?? null }));
            }
            return () => {
                // console.log('Screen is unfocused');
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
        { PropName: "species", Field: Field.Drop, dropData: dropData(Object.values(Species)) },
        { PropName: "weight", Field: Field.Dec },
        { PropName: "age", Field: Field.Int },
        { PropName: "sex", Field: Field.Drop, dropData: dropData(Object.values(Sex)) },
        { PropName: "embryo", Field: Field.Tick, disabled: disableFemaleTraits },
        { PropName: "milk", Field: Field.Tick, disabled: disableFemaleTraits },
        { PropName: "comments", Field: Field.Text },
    ];




    // useEffect(() => {
    //     const fetchDeer = async () => {
    //         if (isUpdate) {
    //             const deerDocument = await getDocumentByIdAppWrite(updateDeerId, Collection.deer);
    //             const deerObj = deerDocument as unknown as Deer;
    //             setForm(deerObj);
    //         }
    //     };

    //     fetchDeer();
    // }, [updateDeerId]);



    const submit = async () => {

        const validationIssues = validateDeer(deerForm);
        if (validationIssues.length > 0) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setSubmitting(true);

        try {
            if (isUpdate) {
                await updateAppWrite(updateDeerId, deerForm, Collection.deer)
            }
            else {

                const userId = user?.$id ?? null
                console.log("USER ID IS:" + userId)
                // setForm(prevForm => ({ ...prevForm, userId: userId }));
                console.log(deerForm);
                const responce = await createAppWrite(deerForm, Collection.deer);
                console.log(responce);
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
            deleteAppWrite(updateDeerId, Collection.deer)
            setModalExitVisible(true);

        } catch (error: any) {
            Alert.alert("Error", error.message);
            throw error;
        }

    };


    return (
        <CustomScreenWrapper>

            <Text className="text-2xl font-semibold text-white font-psemibold">
                {isUpdate ? "Add a new deer" : "Update Deer"}
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
                handlePress={(submit)}
                containerStyles="mt-7 mb-7"
                isLoading={isSubmitting}
            />

            {isUpdate && (
                <CustomButton
                    title={"Delete Deer"}
                    handlePress={() => setModalDeleteVisible(true)}
                    containerStyles="mt-7"
                    isLoading={isDeleting}
                />
            )}


            <Modal
                animationType="slide"
                transparent={true}
                visible={modalDeleteVisible}
                onRequestClose={() => {
                    setModalDeleteVisible(false);
                }}>

                <View style={{ backgroundColor: 'white', padding: 20 }}>
                    <Text className="text-xl font-semibold">Are you sure you want to delete this deer?</Text>
                    <CustomButton
                        title="Yes"
                        handlePress={modalDeleteYes}
                        containerStyles="mt-7"
                        isLoading={isDeleting}
                    />
                    <CustomButton
                        title="No"
                        handlePress={() => setModalDeleteVisible(false)}
                        containerStyles="mt-7"
                        isLoading={isDeleting}
                    />
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
                        <Text className="text-xl font-semibold">Successful Operation, please click here to go home</Text>
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

        </CustomScreenWrapper>
    );
};
