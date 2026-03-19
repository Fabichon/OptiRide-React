export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Compare: { tripKey: string };
  Accounts: undefined;
  Redirect: {
    rideId: number;
    tripKey: string;
  };
};

export type DrawerParamList = {
  HomeStack: undefined;
};
