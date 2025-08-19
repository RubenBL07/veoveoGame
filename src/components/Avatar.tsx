interface AvatarProps {
  username?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar = ({ username, avatarUrl, size = 'md', className = '' }: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl'
  };

  const initial = username ? username.charAt(0).toUpperCase() : '?';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Avatar de ${username}`}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`avatar-initial ${sizeClasses[size]} ${className}`}>
      {initial}
    </div>
  );
};