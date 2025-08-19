interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner = ({ message = "Cargando...", className = "" }: LoadingSpinnerProps) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-background ${className}`}>
      <div className="text-center space-y-4">
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h1 className="text-xl text-foreground font-medium">{message}</h1>
      </div>
    </div>
  );
};