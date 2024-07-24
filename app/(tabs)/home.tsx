import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";
import CustomButton from "@/components/myComponents/CustomButton";
import { signOut } from "@/lib/appwrite";
import { useGlobalContext } from "@/context/GlobalProvider";
import CustomScreenWrapper from "@/components/myComponents/CustomScreenWrapper";


export default function Home() {

    const { setUser, setIsLogged } = useGlobalContext();

    const logout = async () => {
        await signOut();
        setUser(null);
        setIsLogged(false);
        router.replace("/signIn");
    };

    return (
        <CustomScreenWrapper>

            <View className="items-center">
                <Text className="text-2xl text-white font-psemibold">
                    Welcome to the app
                </Text>
                <Text className="text-2xl text-white font-psemibold mt-2 ">
                    Choose what you would like to do
                </Text>
            </View>

            <CustomButton title="New Cull Record" handlePress={() => router.push("/deerForm")} containerStyles="w-full mt-7" isLoading={false} />
            <CustomButton title="View Existing Cull Records" handlePress={() => router.push("/deerList")} containerStyles="w-full mt-7" isLoading={false} />
            <CustomButton title="Profile & Settings" handlePress={() => router.push("/profile")} containerStyles="w-full mt-7" isLoading={false} />

            <CustomButton title="LOG OUT" handlePress={() => logout()} containerStyles="w-full mt-7 bg-gray" isLoading={false} />

        </CustomScreenWrapper>

    );
}
