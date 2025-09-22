// app/(tabs)/_layout.tsx
import { View, Text } from 'react-native';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <View style={{ flex: 1 }}>{children}</View>;
};
export default Layout;
