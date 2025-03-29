import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { LoginCredentials } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2, AlertCircle, CheckCircle, Mail, Lock, User } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Kullanıcı adı gereklidir" }),
  password: z.string().min(1, { message: "Şifre gereklidir" }),
});

// Register form schema - extends the user schema
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır" }),
  terms: z.boolean().refine(val => val === true, {
    message: "Kullanım şartlarını kabul etmelisiniz",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

// Recovery form schema
const recoverySchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
});

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recover'>('login');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });
  
  // Recovery form
  const recoveryForm = useForm<z.infer<typeof recoverySchema>>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      email: "",
    },
  });
  
  // Handle login submission
  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    setFormError(null);
    
    const credentials: LoginCredentials = {
      username: data.username,
      password: data.password,
    };
    
    loginMutation.mutate(credentials, {
      onSuccess: () => {
        setLocation('/');
      },
      onError: (error) => {
        setFormError(error.message || "Giriş başarısız. Lütfen kullanıcı adı ve şifrenizi kontrol edin.");
      },
    });
  };
  
  // Handle register submission
  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    setFormError(null);
    
    const { confirmPassword, terms, ...userData } = data;
    
    registerMutation.mutate(userData, {
      onSuccess: () => {
        setLocation('/');
      },
      onError: (error) => {
        setFormError(error.message || "Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.");
      },
    });
  };
  
  // Handle password recovery
  const onRecoverSubmit = (data: z.infer<typeof recoverySchema>) => {
    setFormError(null);
    setFormSuccess(`Şifre sıfırlama bağlantısı ${data.email} adresine gönderildi.`);
    
    // This would typically call an API endpoint
    // In this implementation we just show a success message
  };
  
  // If still loading user state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B0E11] text-[#EAECEF]">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#F0B90B]" />
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E11] text-[#EAECEF]">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Hero section */}
          <div className="hidden md:block">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                  <span className="text-[#F0B90B]">Sekance</span> ile Finansal Geleceğe Açılın
                </h1>
                <p className="text-xl text-[#848E9C]">
                  Global finansal pazarlara erişin, ülke ekonomilerini takip edin ve yatırımlarınızı çeşitlendirin.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#F0B90B]/10 flex items-center justify-center text-[#F0B90B]">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <p className="text-lg">193 ülke tahvillerinden dilediğinizi satın alın</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#F0B90B]/10 flex items-center justify-center text-[#F0B90B]">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <p className="text-lg">3x, 10x, 20x ve 50x kaldıraç oranları</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#F0B90B]/10 flex items-center justify-center text-[#F0B90B]">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <p className="text-lg">Canlı haber akışı ve piyasa analizleri</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Auth forms */}
          <div>
            <Card className="bg-[#1E2329] border-[#2B2F36]">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">
                  {authMode === 'login' && 'Sekance Hesabınıza Giriş Yapın'}
                  {authMode === 'register' && 'Yeni Hesap Oluşturun'}
                  {authMode === 'recover' && 'Şifrenizi Sıfırlayın'}
                </CardTitle>
                <CardDescription className="text-center">
                  {authMode === 'login' && 'Kullanıcı adınızı ve şifrenizi girerek devam edin'}
                  {authMode === 'register' && 'Hesap bilgilerinizi doldurarak kayıt olun'}
                  {authMode === 'recover' && 'E-posta adresinizi girerek şifre sıfırlama bağlantısı alın'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Error & Success Messages */}
                {formError && (
                  <div className="p-3 rounded-md bg-red-900/20 border border-red-800 text-red-200 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p>{formError}</p>
                  </div>
                )}
                
                {formSuccess && (
                  <div className="p-3 rounded-md bg-green-900/20 border border-green-800 text-green-200 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <p>{formSuccess}</p>
                  </div>
                )}
                
                {/* Login Form */}
                {authMode === 'login' && (
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kullanıcı Adı</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-[#171B22] border-[#2B2F36] pl-10"
                                  autoComplete="username"
                                />
                              </FormControl>
                              <User className="absolute left-3 top-2.5 h-5 w-5 text-[#848E9C]" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Şifre</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  className="bg-[#171B22] border-[#2B2F36] pl-10"
                                  autoComplete="current-password"
                                />
                              </FormControl>
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-[#848E9C]" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#F0B90B] text-[#1E2329] hover:bg-[#F0B90B]/90"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ArrowRight className="h-4 w-4 mr-2" />
                        )}
                        Giriş Yap
                      </Button>
                    </form>
                  </Form>
                )}
                
                {/* Register Form */}
                {authMode === 'register' && (
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kullanıcı Adı</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-[#171B22] border-[#2B2F36] pl-10"
                                  autoComplete="username"
                                />
                              </FormControl>
                              <User className="absolute left-3 top-2.5 h-5 w-5 text-[#848E9C]" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-posta Adresi</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  className="bg-[#171B22] border-[#2B2F36] pl-10"
                                  autoComplete="email"
                                />
                              </FormControl>
                              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-[#848E9C]" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Şifre</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  className="bg-[#171B22] border-[#2B2F36] pl-10"
                                  autoComplete="new-password"
                                />
                              </FormControl>
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-[#848E9C]" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Şifre Tekrar</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  className="bg-[#171B22] border-[#2B2F36] pl-10"
                                  autoComplete="new-password"
                                />
                              </FormControl>
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-[#848E9C]" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="terms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="w-4 h-4 mt-1 rounded border-[#2B2F36] bg-[#171B22] checked:bg-[#F0B90B]"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              Kullanım şartlarını ve gizlilik politikasını kabul ediyorum
                            </FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#F0B90B] text-[#1E2329] hover:bg-[#F0B90B]/90"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ArrowRight className="h-4 w-4 mr-2" />
                        )}
                        Hesap Oluştur
                      </Button>
                    </form>
                  </Form>
                )}
                
                {/* Password Recovery Form */}
                {authMode === 'recover' && (
                  <Form {...recoveryForm}>
                    <form onSubmit={recoveryForm.handleSubmit(onRecoverSubmit)} className="space-y-4">
                      <FormField
                        control={recoveryForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-posta Adresi</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  className="bg-[#171B22] border-[#2B2F36] pl-10"
                                  autoComplete="email"
                                />
                              </FormControl>
                              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-[#848E9C]" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#F0B90B] text-[#1E2329] hover:bg-[#F0B90B]/90"
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Şifre Sıfırlama Bağlantısı Gönder
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="w-full h-px bg-[#2B2F36]"></div>
                
                {authMode === 'login' && (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-[#848E9C]">Henüz hesabınız yok mu?</p>
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setAuthMode('register');
                        setFormError(null);
                        setFormSuccess(null);
                      }}
                      className="text-[#F0B90B] hover:text-[#F0B90B]/80"
                    >
                      Yeni Hesap Oluştur
                    </Button>
                    <div className="mt-2">
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setAuthMode('recover');
                          setFormError(null);
                          setFormSuccess(null);
                        }}
                        className="text-[#848E9C] hover:text-white text-sm"
                      >
                        Şifremi Unuttum
                      </Button>
                    </div>
                  </div>
                )}
                
                {authMode === 'register' && (
                  <div className="text-center">
                    <p className="text-sm text-[#848E9C]">Zaten hesabınız var mı?</p>
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setAuthMode('login');
                        setFormError(null);
                        setFormSuccess(null);
                      }}
                      className="text-[#F0B90B] hover:text-[#F0B90B]/80"
                    >
                      Giriş Yapın
                    </Button>
                  </div>
                )}
                
                {authMode === 'recover' && (
                  <div className="text-center">
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setAuthMode('login');
                        setFormError(null);
                      }}
                      className="text-[#F0B90B] hover:text-[#F0B90B]/80"
                    >
                      Giriş Sayfasına Dön
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}