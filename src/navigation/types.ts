export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  MainTabs: { screen?: string } | undefined;
  HomeTab: undefined; // Keeping for internal ref if needed, to allow direct navigation
  StartJourney: undefined;
  Tracking: { activityType: string };
  Summary: {
    distance: number;
    duration: number;
    coordinates: { latitude: number; longitude: number; timestamp: number }[];
    activityType: string;
  };
  JourneyDetail: { journeyId: string };
  TimelineTab: undefined;
  ProfileTab: undefined;
  Settings: undefined;
  EditProfile: undefined;
};
