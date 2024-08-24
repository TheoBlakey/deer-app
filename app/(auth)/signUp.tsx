import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { createUser } from "@/lib/appwrite";
import { useGlobalContext } from "@/context/GlobalProvider";
import FormField, { Field } from "@/components/myComponents/FormField";
import CustomButton from "@/components/myComponents/CustomButton";
import CustomScreenWrapper from "@/components/myComponents/CustomScreenWrapper";

const SignUp = () => {
    const { setUser, setIsLogged } = useGlobalContext();

    const [isSubmitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const submit = async () => {
        if (form.username === "" || form.email === "" || form.password === "") {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setSubmitting(true);
        try {
            const result = await createUser(form.email, form.password, form.username);
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
            {/* <Image
                        source={images.logo}
                        resizeMode="contain"
                        className="w-[115px] h-[34px]"
                    /> */}

            <Text className="text-2xl font-semibold text-white mt-14 font-psemibold mb-5">
                Sign Up to The Deer App
            </Text>

            <FormField
                FieldInfo={{
                    Field: Field.Text,
                    PropName: "username"
                }}
                Form={form}
                SetFormAbove={setForm}
            />

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
                title="Sign Up"
                handlePress={submit}
                containerStyles="mt-7"
                isLoading={isSubmitting}
            />

            <View className="flex justify-center pt-5 flex-row gap-2">
                <Text className="text-lg text-gray-100 font-pregular">
                    Have an account already?
                </Text>
                <Link
                    href="/signIn"
                    className="text-lg font-psemibold text-secondary"
                >
                    Login
                </Link>
            </View>

        </CustomScreenWrapper>
    );
};

export default SignUp;
