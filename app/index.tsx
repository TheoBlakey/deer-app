import React, { useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';
import 'react-native-url-polyfill/auto';
import { useGlobalContext } from '@/context/GlobalProvider';
import { View, Text, ActivityIndicator } from 'react-native'; // Adjust the import according to your routing library

export default function AppIndex() {
    const { loading, isLogged } = useGlobalContext();
    const router = useRouter();

    useEffect(() => {
        if (loading) return; // Do nothing if still loading

        if (router.canGoBack()) {
            router.back();
        } else if (!isLogged) {
            router.replace('/signIn');
        } else {
            router.replace('/home');
        }
    }, [loading, isLogged, router]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white mt-4 text-2xl font-bold">Loading...</Text>
            </View>
        );
    }

    return null; // Return null or any placeholder until navigation is complete
};