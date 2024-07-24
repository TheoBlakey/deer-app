import { Redirect, Stack, Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';

export default function AuthLayout() {

    const { loading, isLogged } = useGlobalContext();
    if (!loading && isLogged) return <Redirect href="/home" />;

    return (
        <Stack>
            <Stack.Screen name="signIn" options={{ headerShown: false }} />
            <Stack.Screen name="signUp" options={{ headerShown: false }} />
        </Stack>
    );
}
