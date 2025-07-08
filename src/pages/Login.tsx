
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Gavel } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { user, login, signUp } = useAuth();
  const { toast } = useToast();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await login(email, password);
        
      if (error) {
        let errorMessage = "Ocorreu um erro inesperado";
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Email ou senha incorretos";
        } else if (error.message.includes('User already registered')) {
          errorMessage = "Usuário já cadastrado. Tente fazer login.";
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Email inválido";
        }
        
        toast({
          title: isSignUp ? "Erro no cadastro" : "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        if (isSignUp) {
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar a conta",
          });
        } else {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo ao LicitaBrasil",
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: isSignUp ? "Erro no cadastro" : "Erro no login",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Gavel className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LicitaBrasil</h1>
          <p className="text-gray-600">Sua plataforma de licitações públicas</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isSignUp ? 'Criar Conta' : 'Fazer Login'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? 'Crie sua conta para acessar a plataforma'
                : 'Entre com suas credenciais para acessar sua conta'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Mínimo 6 caracteres" : "Sua senha"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isSignUp ? "Criando conta..." : "Entrando...") 
                  : (isSignUp ? "Criar Conta" : "Entrar")
                }
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
              </p>
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
              >
                {isSignUp ? 'Fazer login' : 'Criar conta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
