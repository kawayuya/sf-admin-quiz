import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "fullScreenModal",
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
