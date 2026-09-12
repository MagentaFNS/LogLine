import { Image, View, Text, StyleSheet } from 'react-native';
import { COLORS, getAvatarUrl } from '../config';

interface Props {
  uri?: string;
  username?: string;
  size?: number;
}

export const Avatar = ({ uri, username, size = 44 }: Props) => {
  const firstLetter = username?.[0]?.toUpperCase() || '?';
  const fullUrl = getAvatarUrl(uri);

  if (fullUrl) {
    return (
      <Image
        source={{ uri: fullUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#000',
        }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.letter, { fontSize: size * 0.4 }]}>
        {firstLetter}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    color: COLORS.white,
    fontWeight: '800',
  },
});
