import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { 
  Loader2, User, Lock, CreditCard, Settings, Shield, History, 
  LogOut, ChevronRight, Edit, CheckCircle, ArrowRight, Plus, Wallet
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("account");
  
  // Formlar için state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Kullanıcı bilgileri için form state'i
  const [profileForm, setProfileForm] = useState<{email: string, username: string}>({
    email: user?.email || "",
    username: user?.username || ""
  });
  
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  
  // Profil düzenleme işlevi
  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // API'ye güncelleme isteği gönderilecek
    // toast ile bildirim gösterilecek
  };
  
  // Şifre değiştirme işlevi
  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // API'ye şifre güncelleme isteği gönderilecek
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      // toast.error("Şifreler eşleşmiyor");
      return;
    }
    // toast ile bildirim gösterilecek
  };
  
  // Ödeme işlevi
  const handleDeposit = () => {
    if (!paymentMethod || !paymentAmount) {
      // toast.error("Lütfen ödeme yöntemi ve miktarı seçin");
      return;
    }
    // Ödeme işlemi başlatılacak
    // toast ile bildirim gösterilecek
  };
  
  // Oturum kapatma işlevi
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/auth");
      }
    });
  };
  
  // Yükleniyor durumu
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
  
  // Kullanıcı giriş yapmamışsa auth sayfasına yönlendir
  if (!user) {
    setLocation("/auth");
    return null;
  }
  
  // Ana sayfa içeriği
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E11] text-[#EAECEF]">
      <Header />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sol kenar çubuğu - Menü */}
          <div className="w-full md:w-64">
            <Card className="bg-[#1E2329] border-[#2B2F36]">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border border-[#F0B90B]">
                    <AvatarFallback className="bg-[#F0B90B] text-[#1E2329] text-lg font-bold">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                    <AvatarImage src="/path/to/avatar.jpg" />
                  </Avatar>
                  <div>
                    <div className="text-lg font-semibold">{user.username}</div>
                    <div className="text-sm text-[#848E9C]">{user.email}</div>
                    <Badge className="mt-1 bg-[#F0B90B] text-black">Basic Tier</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Separator className="bg-[#2B2F36]" />
                <ul className="py-2">
                  <li>
                    <button 
                      className={`flex items-center w-full px-4 py-3 hover:bg-[#2B2F36] transition-colors ${activeTab === 'account' ? 'bg-[#2B2F36]' : ''}`}
                      onClick={() => setActiveTab("account")}
                    >
                      <User className="h-5 w-5 mr-3 text-[#F0B90B]" />
                      <span>Hesap Bilgileri</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`flex items-center w-full px-4 py-3 hover:bg-[#2B2F36] transition-colors ${activeTab === 'security' ? 'bg-[#2B2F36]' : ''}`}
                      onClick={() => setActiveTab("security")}
                    >
                      <Lock className="h-5 w-5 mr-3 text-[#F0B90B]" />
                      <span>Güvenlik</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`flex items-center w-full px-4 py-3 hover:bg-[#2B2F36] transition-colors ${activeTab === 'payment' ? 'bg-[#2B2F36]' : ''}`}
                      onClick={() => setActiveTab("payment")}
                    >
                      <CreditCard className="h-5 w-5 mr-3 text-[#F0B90B]" />
                      <span>Ödeme Yöntemleri</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`flex items-center w-full px-4 py-3 hover:bg-[#2B2F36] transition-colors ${activeTab === 'transactions' ? 'bg-[#2B2F36]' : ''}`}
                      onClick={() => setActiveTab("transactions")}
                    >
                      <History className="h-5 w-5 mr-3 text-[#F0B90B]" />
                      <span>İşlem Geçmişi</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </button>
                  </li>
                </ul>
                <Separator className="bg-[#2B2F36]" />
                <div className="p-4">
                  <Button 
                    variant="destructive" 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Çıkış Yap
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Ana içerik alanı */}
          <div className="flex-grow">
            {/* Hesap Bilgileri */}
            {activeTab === "account" && (
              <Card className="bg-[#1E2329] border-[#2B2F36]">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <User className="h-5 w-5 mr-2 text-[#F0B90B]" />
                    Hesap Bilgileri
                  </CardTitle>
                  <CardDescription>
                    Kişisel bilgilerinizi görüntüleyin ve düzenleyin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="username">Kullanıcı Adı</Label>
                          <div className="relative">
                            <Input 
                              id="username"
                              value={profileForm.username}
                              onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                              className="bg-[#171B22] border-[#2B2F36] pr-10"
                            />
                            <Edit className="absolute right-3 top-2.5 h-4 w-4 text-[#848E9C]" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">E-posta Adresi</Label>
                          <div className="relative">
                            <Input 
                              id="email"
                              type="email"
                              value={profileForm.email}
                              onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                              className="bg-[#171B22] border-[#2B2F36] pr-10"
                            />
                            <Edit className="absolute right-3 top-2.5 h-4 w-4 text-[#848E9C]" />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Hesap Doğrulama</Label>
                        <div className="mt-2 bg-[#171B22] p-4 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>E-posta doğrulama</span>
                            </div>
                            <Badge className="bg-green-600">Tamamlandı</Badge>
                          </div>
                          
                          <Separator className="my-3 bg-[#2B2F36]" />
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Shield className="h-5 w-5 text-[#848E9C]" />
                              <span>Kimlik doğrulama (KYC)</span>
                            </div>
                            <Button variant="outline" size="sm" className="border-[#F0B90B] text-[#F0B90B] hover:bg-[#F0B90B]/10">
                              Doğrula
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button type="submit" className="bg-[#F0B90B] text-[#1E2329] hover:bg-[#F0B90B]/90">
                        Değişiklikleri Kaydet
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            
            {/* Güvenlik */}
            {activeTab === "security" && (
              <Card className="bg-[#1E2329] border-[#2B2F36]">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-[#F0B90B]" />
                    Güvenlik Ayarları
                  </CardTitle>
                  <CardDescription>
                    Hesap güvenliğinizi yönetin ve şifrenizi değiştirin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Şifre değiştirme formu */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Şifre Değiştirme</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                        <Input 
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          className="bg-[#171B22] border-[#2B2F36]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Yeni Şifre</Label>
                        <Input 
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          className="bg-[#171B22] border-[#2B2F36]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                        <Input 
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          className="bg-[#171B22] border-[#2B2F36]"
                        />
                      </div>
                      
                      <Button type="submit" className="bg-[#F0B90B] text-[#1E2329] hover:bg-[#F0B90B]/90">
                        Şifreyi Değiştir
                      </Button>
                    </form>
                  </div>
                  
                  {/* Güvenlik ayarları */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Gelişmiş Güvenlik</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">2FA Doğrulama</h4>
                          <p className="text-sm text-[#848E9C]">İki faktörlü kimlik doğrulama ile hesabınızı koruyun</p>
                        </div>
                        <Button variant="outline" className="border-[#F0B90B] text-[#F0B90B] hover:bg-[#F0B90B]/10">
                          Etkinleştir
                        </Button>
                      </div>
                      
                      <Separator className="bg-[#2B2F36]" />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Oturum Doğrulama</h4>
                          <p className="text-sm text-[#848E9C]">Yeni cihazlardan giriş yaparken e-posta doğrulaması isteyin</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <Separator className="bg-[#2B2F36]" />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Whitelist IP Adresleri</h4>
                          <p className="text-sm text-[#848E9C]">Sadece güvendiğiniz IP adreslerinden erişime izin verin</p>
                        </div>
                        <Button variant="outline" className="border-[#2B2F36] hover:bg-[#2B2F36]">
                          Yönet
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Ödeme yöntemleri */}
            {activeTab === "payment" && (
              <Card className="bg-[#1E2329] border-[#2B2F36]">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-[#F0B90B]" />
                    Ödeme Yöntemleri ve Bakiye
                  </CardTitle>
                  <CardDescription>
                    Bakiye yükleyin ve ödeme yöntemlerinizi yönetin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Bakiye Bilgisi */}
                  <div className="mb-8 bg-gradient-to-r from-[#F0B90B] to-[#F8D33A] p-6 rounded-lg text-[#1E2329]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium opacity-80">Toplam Bakiye</p>
                        <h2 className="text-3xl font-bold">1,250.00 USDT</h2>
                      </div>
                      <Wallet className="h-10 w-10" />
                    </div>
                    <div className="flex gap-3">
                      <Button className="bg-[#1E2329] hover:bg-[#2B2F36] text-white">
                        Para Yatır
                      </Button>
                      <Button variant="outline" className="border-[#1E2329] text-[#1E2329] hover:bg-[#1E2329]/10">
                        Para Çek
                      </Button>
                    </div>
                  </div>
                  
                  {/* Para yatırma */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Para Yatırma</h3>
                    <div className="bg-[#171B22] p-6 rounded-lg">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="depositAmount">Yatırılacak Miktar (USDT)</Label>
                          <Input 
                            id="depositAmount"
                            type="number"
                            placeholder="0.00"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="bg-[#12151C] border-[#2B2F36] mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label className="mb-2 block">Ödeme Yöntemi</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {["Credit Card", "PayPal", "Bank Transfer", "Apple Pay", "Google Pay"].map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setPaymentMethod(method)}
                                className={`p-4 rounded-lg border ${
                                  paymentMethod === method 
                                    ? 'border-[#F0B90B] bg-[#F0B90B]/5' 
                                    : 'border-[#2B2F36] hover:border-[#F0B90B]'
                                } flex flex-col items-center gap-2 transition-colors`}
                              >
                                <div className="h-10 w-10 rounded-full bg-[#12151C] flex items-center justify-center">
                                  {method === "Credit Card" && <CreditCard className="h-5 w-5" />}
                                  {method === "PayPal" && <div className="text-lg font-bold">P</div>}
                                  {method === "Bank Transfer" && <div className="text-lg font-bold">B</div>}
                                  {method === "Apple Pay" && <div className="text-lg font-bold">A</div>}
                                  {method === "Google Pay" && <div className="text-lg font-bold">G</div>}
                                </div>
                                <span className="text-xs font-medium">{method}</span>
                              </button>
                            ))}
                            
                            <button
                              type="button"
                              className="p-4 rounded-lg border border-dashed border-[#2B2F36] hover:border-[#F0B90B] flex flex-col items-center gap-2 transition-colors"
                            >
                              <div className="h-10 w-10 rounded-full bg-[#12151C] flex items-center justify-center">
                                <Plus className="h-5 w-5" />
                              </div>
                              <span className="text-xs font-medium">Yeni Ekle</span>
                            </button>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={handleDeposit}
                          className="w-full mt-4 bg-[#F0B90B] text-[#1E2329] hover:bg-[#F0B90B]/90"
                        >
                          Para Yatır
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Kayıtlı ödeme yöntemleri */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Kayıtlı Ödeme Yöntemleriniz</h3>
                    <div className="bg-[#171B22] rounded-lg divide-y divide-[#2B2F36]">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#12151C] flex items-center justify-center">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Visa **** 4242</p>
                            <p className="text-xs text-[#848E9C]">Son kullanma: 12/25</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-[#2B2F36] hover:bg-[#2B2F36]">
                            Düzenle
                          </Button>
                          <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-600/10">
                            Sil
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#12151C] flex items-center justify-center">
                            <div className="text-lg font-bold">P</div>
                          </div>
                          <div>
                            <p className="font-medium">PayPal</p>
                            <p className="text-xs text-[#848E9C]">user@example.com</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-[#2B2F36] hover:bg-[#2B2F36]">
                            Düzenle
                          </Button>
                          <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-600/10">
                            Sil
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* İşlem geçmişi */}
            {activeTab === "transactions" && (
              <Card className="bg-[#1E2329] border-[#2B2F36]">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <History className="h-5 w-5 mr-2 text-[#F0B90B]" />
                    İşlem Geçmişi
                  </CardTitle>
                  <CardDescription>
                    Gerçekleştirdiğiniz tüm işlemleri görüntüleyin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" className="mb-6">
                    <TabsList className="grid grid-cols-4 bg-[#171B22]">
                      <TabsTrigger value="all">Tümü</TabsTrigger>
                      <TabsTrigger value="deposits">Yatırılan</TabsTrigger>
                      <TabsTrigger value="withdrawals">Çekilen</TabsTrigger>
                      <TabsTrigger value="trades">Alım/Satım</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#2B2F36] text-[#848E9C] text-xs">
                          <th className="text-left py-3 px-4">İşlem Tarihi</th>
                          <th className="text-left py-3 px-4">İşlem Türü</th>
                          <th className="text-left py-3 px-4">Miktar</th>
                          <th className="text-left py-3 px-4">Para Birimi</th>
                          <th className="text-left py-3 px-4">Durum</th>
                          <th className="text-left py-3 px-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { date: "2025-03-28 14:23", type: "Deposit", amount: 500, currency: "USDT", status: "Completed" },
                          { date: "2025-03-26 09:15", type: "Buy", amount: 250, currency: "US", status: "Completed" },
                          { date: "2025-03-25 16:42", type: "Sell", amount: 100, currency: "TR", status: "Completed" },
                          { date: "2025-03-22 11:38", type: "Withdrawal", amount: 150, currency: "USDT", status: "Pending" },
                        ].map((transaction, index) => (
                          <tr key={index} className="border-b border-[#2B2F36]">
                            <td className="py-4 px-4">{transaction.date}</td>
                            <td className="py-4 px-4">
                              <Badge className={`
                                ${transaction.type === 'Deposit' ? 'bg-green-600' : ''}
                                ${transaction.type === 'Withdrawal' ? 'bg-orange-600' : ''}
                                ${transaction.type === 'Buy' ? 'bg-blue-600' : ''}
                                ${transaction.type === 'Sell' ? 'bg-red-600' : ''}
                              `}>
                                {transaction.type}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 font-medium">
                              {transaction.type === "Deposit" || transaction.type === "Buy" ? "+" : "-"}
                              {transaction.amount}
                            </td>
                            <td className="py-4 px-4">{transaction.currency}</td>
                            <td className="py-4 px-4">
                              <Badge className={`bg-opacity-20 ${
                                transaction.status === 'Completed' ? 'bg-green-600 text-green-600' : 'bg-yellow-600 text-yellow-600'
                              }`}>
                                {transaction.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Button variant="ghost" size="sm" className="text-[#848E9C] hover:text-white">
                                Detaylar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileNavigation />
    </div>
  );
}