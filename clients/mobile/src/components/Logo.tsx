import { View, Image, StyleSheet } from 'react-native';
import { COLORS } from '../config';

interface Props {
  size?: number;
}

export const Logo = ({ size = 40 }: Props) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={require('../../public/favicon.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
