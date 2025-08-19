import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signUp(email, password, name);
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-12 w-28 h-28 bg-vibrant-green/15 rounded-full blur-3xl"></div>
        <div className="absolute top-48 right-16 w-32 h-32 bg-vibrant-pink/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-8 w-24 h-24 bg-vibrant-yellow/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-12 w-36 h-36 bg-vibrant-blue/15 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-sm relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="glass-card p-4 inline-block">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg">
                <Eye className="w-9 h-9 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground tracking-wide">Veo Veo</h1>
                <p className="text-muted-foreground font-medium text-sm">¡Bienvenido!</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth Card */}
        <div className="glass-card p-6">
          <Tabs defaultValue="signin" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-2xl">
              <TabsTrigger value="signin" className="rounded-xl font-bold">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl font-bold">Registro</TabsTrigger>
            </TabsList>
              
            <TabsContent value="signin" className="space-y-5">
              {error && (
                <div className="bg-destructive/15 border border-destructive/50 rounded-2xl p-3 text-destructive text-sm font-medium">
                  {error}
                </div>
              )}
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="signin-email" className="text-foreground font-bold">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 rounded-2xl border-border bg-muted/50 text-foreground font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signin-password" className="text-foreground font-bold">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-14 rounded-2xl border-border bg-muted/50 text-foreground font-medium pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-black rounded-2xl bg-primary hover:bg-primary/90 mt-6" 
                  disabled={loading}
                >
                  {loading ? "Iniciando..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>
              
            <TabsContent value="signup" className="space-y-5">
              {error && (
                <div className="bg-destructive/15 border border-destructive/50 rounded-2xl p-3 text-destructive text-sm font-medium">
                  {error}
                </div>
              )}
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="signup-name" className="text-foreground font-bold">Nombre</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 rounded-2xl border-border bg-muted/50 text-foreground font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signup-email" className="text-foreground font-bold">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 rounded-2xl border-border bg-muted/50 text-foreground font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signup-password" className="text-foreground font-bold">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-14 rounded-2xl border-border bg-muted/50 text-foreground font-medium pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-black rounded-2xl bg-primary hover:bg-primary/90 mt-6" 
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Crear Cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Back to Welcome */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground rounded-2xl font-bold"
          >
            ← Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;