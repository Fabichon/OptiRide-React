import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SplashScreen } from '../screens/SplashScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CompareScreen } from '../screens/CompareScreen';
import { AccountsScreen } from '../screens/AccountsScreen';
import { RedirectModal } from '../screens/RedirectModal';
import { DrawerContent } from '../screens/DrawerContent';
import { HistorySheet } from '../screens/HistorySheet';
import { useAppStore } from '../store/useAppStore';
import { TRIPS } from '../data';
import type { Ride } from '../types';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function HomeStackNavigator() {
  const [redirectVisible, setRedirectVisible] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const navigationRef = useRef<any>(null);

  const pendingDrawerAction = useAppStore((s) => s.pendingDrawerAction);
  const setPendingDrawerAction = useAppStore((s) => s.setPendingDrawerAction);

  useEffect(() => {
    if (!pendingDrawerAction) return;
    switch (pendingDrawerAction) {
      case 'history':
        setHistoryVisible(true);
        break;
    }
    setPendingDrawerAction(null);
  }, [pendingDrawerAction, setPendingDrawerAction]);

  // Close modal and reopen the drawer menu
  const closeModalAndOpenDrawer = useCallback((setter: (v: boolean) => void) => {
    setter(false);
    // Small delay to let the modal dismiss animation complete before reopening drawer
    setTimeout(() => {
      navigationRef.current?.dispatch(DrawerActions.openDrawer());
    }, 350);
  }, []);

  const handleBookRide = useCallback((ride: Ride) => {
    setSelectedRide(ride);
    setRedirectVisible(true);
  }, []);

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {({ navigation }) => {
            // Store navigation ref so modals can reopen the drawer
            navigationRef.current = navigation;
            return (
              <HomeScreen
                onOpenDrawer={() => navigation.openDrawer()}
                onNavigateCompare={(tripKey) => navigation.navigate('Compare', { tripKey })}
              />
            );
          }}
        </Stack.Screen>
        <Stack.Screen name="Compare">
          {({ navigation, route }) => (
            <CompareScreen
              tripKey={(route.params as any)?.tripKey ?? 'maison'}
              onBack={() => navigation.goBack()}
              onBookRide={(ride) => handleBookRide(ride)}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Accounts">
          {({ navigation }) => (
            <AccountsScreen onBack={() => {
              navigation.goBack();
              setTimeout(() => navigation.dispatch(DrawerActions.openDrawer()), 350);
            }} />
          )}
        </Stack.Screen>
      </Stack.Navigator>

      <RedirectModal
        visible={redirectVisible}
        ride={selectedRide}
        onClose={() => setRedirectVisible(false)}
      />
      <HistorySheet
        visible={historyVisible}
        onClose={() => closeModalAndOpenDrawer(setHistoryVisible)}
      />
    </>
  );
}

function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false, drawerType: 'front', drawerStyle: { width: 300 } }}
      drawerContent={(props) => (
        <DrawerContent
          onClose={() => props.navigation.closeDrawer()}
          onNavigate={(screen) => {
            props.navigation.closeDrawer();
            if (screen === 'accounts') {
              props.navigation.navigate('HomeStack', { screen: 'Accounts' });
            } else {
              useAppStore.getState().setPendingDrawerAction(screen);
            }
          }}
        />
      )}
    >
      <Drawer.Screen name="HomeStack" component={HomeStackNavigator} />
    </Drawer.Navigator>
  );
}

export function RootNavigator() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    useAppStore.getState().hydrateProviderTokens();
  }, []);

  if (!splashDone) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <SplashScreen onDone={() => setSplashDone(true)} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <MainDrawerNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
