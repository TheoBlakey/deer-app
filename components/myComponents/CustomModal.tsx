import { router } from "expo-router";
import { Modal, View, Text } from "react-native";
import CustomButton from "./CustomButton";
import { forwardRef, useImperativeHandle, useState } from "react";

const CustomModal = forwardRef((props, ref) => {
    const [modalVisible, setModalVisible] = useState(false);

    useImperativeHandle(ref, () => ({
        openModal,
    }));

    function openModal() {
        setModalVisible(true);
    }


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(false);
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
                            setModalVisible(false);
                            router.replace("/home");
                        }}
                        containerStyles="mt-7 w-40"
                    />
                </View>
            </View>
        </Modal>
    );
});

export default CustomModal;
