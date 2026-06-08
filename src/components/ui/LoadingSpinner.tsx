export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${sizeMap[size]}`}
    />
  );
};