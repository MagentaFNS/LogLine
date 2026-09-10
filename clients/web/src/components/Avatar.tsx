import { getAvatarUrl } from '../config';

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
      <img
        src={fullUrl}
        alt={username}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          objectFit: 'cover',
          background: '#000',
        }}
        onError={(e) => {
          // Если картинка не загрузилась — прячем её
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: '#000',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 800,
      }}
    >
      {firstLetter}
    </div>
  );
};
