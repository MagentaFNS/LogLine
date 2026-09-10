import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useStore } from './src/store/useStore';
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MainTabs } from './src/screens/MainTabs';
import { COLORS } from './src/config';

export default function App() {
  const { currentUser, isLoading, fetchCurrentUser } = useStore();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => { fetchCurrentUser(); }, []);

  if (!splashDone) {
    return (
      <>
        <StatusBar style="dark" />
        <SplashScreen onFinish={() => setSplashDone(true)} />
      </>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.black} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={currentUser ? 'dark' : 'light'} />
      <NavigationContainer>
        {currentUser ? <MainTabs /> : <LoginScreen />}
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.offWhite },
});
