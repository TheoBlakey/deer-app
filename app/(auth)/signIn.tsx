import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { getCurrentUser, signIn } from "@/lib/appwrite";

import { useGlobalContext } from "../../context/GlobalProvider";
import FormField, { Field } from "@/components/myComponents/FormField";
import CustomButton from "@/components/myComponents/CustomButton";
import CustomScreenWrapper from "@/components/myComponents/CustomScreenWrapper";

const SignIn = () => {
    const { setUser, setIsLogged } = useGlobalContext();
    const [isSubmitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const submit = async () => {
        if (form.email === "" || form.password === "") {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setSubmitting(true);

        try {
            await signIn(form.email, form.password);

            const result = await getCurrentUser();
            setUser(result);
            setIsLogged(true);
            router.replace("/home");

        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <CustomScreenWrapper>

            <View className="flex-1 justify-center items-center">
                <Image
                    source={images.logo}
                    resizeMode="contain"
                    className="w-40 h-40 mt-5"
                />
            </View>


            <Text className="text-2xl font-semibold text-white font-psemibold mb-5">
                Log in to The Deer App
            </Text>

            <FormField
                FieldInfo={{
                    Field: Field.Text,
                    PropName: "email"
                }}
                Form={form}
                SetFormAbove={setForm}
            />

            <FormField
                FieldInfo={{
                    Field: Field.Text,
                    PropName: "password"
                }}
                Form={form}
                SetFormAbove={setForm}
            />

            <CustomButton
                title="Sign In"
                handlePress={submit}
                containerStyles="mt-7"
                isLoading={isSubmitting}
            />

            <View className="flex justify-center pt-5 flex-row gap-2">
                <Text className="text-lg text-gray-100 font-pregular">
                    Don't have an account?
                </Text>
                <Link
                    href="/signUp"
                    className="text-lg font-psemibold text-secondary"
                >
                    Signup
                </Link>
            </View>

            {/* <View className="flex justify-center pt-5 flex-row gap-2">
                <Text className="text-lg text-gray-100 font-pregular">
                    Need to save a deer offline?
                </Text>
                <Link
                    href="/signUp"
                    className="text-lg font-psemibold text-secondary"
                >
                    Use local storage
                </Link>
            </View> */}

        </CustomScreenWrapper>
    );
};

export default SignIn;
