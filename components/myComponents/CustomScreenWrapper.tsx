import { ReactNode } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";

export default function CustomScreenWrapper({ children }: any) {
    //scollView className = "flex"
    return (
        <SafeAreaView className="bg-primary h-full">
            {/* <ScrollView className="w-full h-full px-4 mb-10 mt-10 pt-10"> */}
            <ScrollView className="w-full px-4 mt-7 pt-10">
                <View className="w-full pb-10" >
                    {children}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}