import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, Modal, Text, View } from "react-native";

import CustomButton from '@/components/myComponents/CustomButton';
import FormField, { Field, FieldInfo, RuleNotNull } from "@/components/myComponents/FormField";
import { Collection, createAppWrite, deleteAppWrite, getCurrentUser, getDocumentsByUserIdAppWrite, updateAppWrite } from "@/lib/appwrite";

import { useGlobalContext } from "../../context/GlobalProvider";

import CustomScreenWrapper from "@/components/myComponents/CustomScreenWrapper";
import React from "react";
import { Models } from "react-native-appwrite";
import { allFieldsPassValidation, resetAllValidation } from "@/lib/validationFunctions";
import CustomModal from "@/components/myComponents/CustomModal";

export default function DeerForm() {

    const { user, setUser } = useGlobalContext();
    const [isSubmitting, setSubmitting] = useState(false);

    const [profileForm, setProfileForm] = useState<profileForm>({ username: user != null ? user.username : "", email: user != null ? user.email : "" });

    const [profileFetchLoading, setProfileFetchLoading] = useState(false);
    const [modalExitVisible, setModalExitVisible] = useState(false);

    interface profileForm {
        username: string;
        email: string;

    }

    const [placesInDatabase, setplacesInDatabase] = useState<Models.Document[]>([]);

    const fetchPlaceList = async () => {
        setProfileFetchLoading(true);

        const upToDateUser = await getCurrentUser();
        setProfileForm({ username: upToDateUser != null ? upToDateUser.username : "", email: upToDateUser != null ? upToDateUser.email : "" })
        const documents = await getDocumentsByUserIdAppWrite(user?.$id ?? "", Collection.place);

        setplacesInDatabase(documents);

        setPlaceDocumentList(documents);
        setProfileFetchLoading(false);
    };




    useFocusEffect(
        useCallback(() => {
            fetchPlaceList();
            return () => {
                resetAllValidation(refList);
            };
        }, []))



    const profileFormFields: FieldInfo[] = [

        { PropName: "username", Field: Field.Text, ValidationRules: [RuleNotNull] },
        { PropName: "email", Field: Field.Text, ValidationRules: [RuleNotNull] }


    ];

    function convertPlace(place: Models.Document) {
        return {
            name: place.name,
            $id: place.$id ?? null,
            userId: user?.$id
        };
    }

    function convertUser(document: profileForm) {
        return {
            username: document.username
            // $id: user?.$id ?? "",
        };
    }


    const submit = async () => {

        if (!allFieldsPassValidation(refList)) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        if (placeDocumentList.some(x => x.name === null || x.name === "")) {
            alert("Error: All places need a name");
            return;
        }

        setSubmitting(true);

        try {


            const updateUser = await updateAppWrite(user?.$id ?? "", convertUser(profileForm), Collection.user);
            setUser(updateUser);

            placeDocumentList.forEach(place => {

                if (place.$id != null) {
                    updateAppWrite(place.$id, convertPlace(place), Collection.place)
                }
                else {
                    createAppWrite(convertPlace(place), Collection.place);
                }

            });

            const listToDelete = placesInDatabase
                .filter(x => !placeDocumentList.some(y => y.$id === x.$id))
                .map(x => x.$id);

            listToDelete.forEach(id => {
                deleteAppWrite(id, Collection.place)
            });

            customModalRef.current.openModal()

        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const [placeDocumentList, setPlaceDocumentList] = useState<Models.Document[]>([]);

    function addEmptyPlace() {
        const newEmptyDocument: any = { name: "" };
        setPlaceDocumentList([...placeDocumentList, newEmptyDocument]);
    }

    function removePlace(index: number) {
        setPlaceDocumentList(placeDocumentList.filter((_, i) => i !== index));
    }

    const refList: (any)[] = [];
    const formComponent = (
        <>
            <Text className={`text-2xl font-semibold text-white font-psemibold`}>
                Update Profile
            </Text>

            <View className="flex-row border-b border-gray-300 pb-2.5 mb-5" />


            {profileFormFields.map((fieldInfo, index) => {

                refList[index] = useRef();
                return (
                    <FormField
                        key={index}
                        FieldInfo={fieldInfo}
                        Form={profileForm}
                        SetFormAbove={setProfileForm}
                        ref={refList[index]}
                    />
                );
            })}

            {/* <View className="flex-row border-b border-gray-300 pb-2.5" /> */}

            <View className="flex-row items-center justify-between mt-5">
                <Text className="text-xl font-semibold text-white font-psemibold">
                    Personal Stalking Locations
                </Text>
                <CustomButton
                    title={"+ Add Place"}
                    handlePress={addEmptyPlace}
                    containerStyles="h-2 w-20"

                />
            </View>

            {placeDocumentList.length === 0 && (
                <Text className="text-l font-semibold text-white font-psemibold mt-3">
                    No places saved. Please add a new place.
                </Text>
            )}

            {placeDocumentList.map((place, index) => {

                return (
                    <View key={index} className="flex-row items-center">
                        <FormField
                            FieldInfo={{
                                PropName: "name",
                                Field: Field.Text,
                                smallTextBox: true,
                                otherStyles: "mt-2",
                                differentTitle: "Place " + (index + 1)
                            }}
                            Form={placeDocumentList}
                            SetFormAbove={setPlaceDocumentList}
                            ListIndex={index}
                        />
                        <CustomButton
                            title="Remove"
                            handlePress={() => removePlace(index)}
                            containerStyles="h-2 w-20 bg-myRed mt-8"
                        />
                    </View>
                );
            })}

            <CustomButton
                title={"Update Profile and Locations"}
                handlePress={submit}
                containerStyles={`mt-7 mb-7`}
                isLoading={isSubmitting}
            />

        </>
    );

    const customModalRef = useRef() as any
    return (
        <CustomScreenWrapper>

            <>
                {profileFetchLoading ? (
                    <View className="flex-1 justify-center items-center mt-60">
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text className="text-white mt-4 text-xl font-bold">Loading...</Text>
                    </View>


                ) : (
                    formComponent
                )}
            </>
            <CustomModal ref={customModalRef}></CustomModal>
        </CustomScreenWrapper>
    );
};