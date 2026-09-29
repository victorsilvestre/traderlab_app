import { Stack } from 'expo-router';
export default function Layout() { return <Stack screenOptions={{ headerStyle: { backgroundColor: '#111827' }, headerTintColor: '#fff' }}><Stack.Screen name="index" options={{ title: 'TraderLab' }} /></Stack>; }

