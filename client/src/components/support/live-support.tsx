import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Send, X } from "lucide-react";

export default function LiveSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{text: string; fromUser: boolean}>>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isChatStarted, setIsChatStarted] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  // Chat başlangıcı
  const startChat = () => {
    if (!name || !email) {
      toast({
        title: t('support.formError') || "Form Error",
        description: t('support.fillAllFields') || "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsChatStarted(true);
    setMessages([
      {
        text: t('support.welcomeMessage', { name }) || `Hello ${name}, how can we help you today?`,
        fromUser: false
      }
    ]);
  };

  // Mesaj gönderme
  const sendMessage = () => {
    if (!message.trim()) return;
    
    // Kullanıcı mesajını ekle
    const newMessages = [...messages, { text: message, fromUser: true }];
    setMessages(newMessages);
    setMessage("");
    
    // Otomatik cevap simülasyonu
    setTimeout(() => {
      let response;
      if (message.toLowerCase().includes("price") || message.toLowerCase().includes("cost") || message.toLowerCase().includes("fee")) {
        response = t('support.priceResponse') || "Our country shares are priced at $0.50 each during pre-sale with 10 million shares available per country.";
      } else if (message.toLowerCase().includes("payment") || message.toLowerCase().includes("credit") || message.toLowerCase().includes("card")) {
        response = t('support.paymentResponse') || "We accept cryptocurrency payments through connected wallets including Metamask, Trust Wallet, and Ledger.";
      } else if (message.toLowerCase().includes("time") || message.toLowerCase().includes("when") || message.toLowerCase().includes("long")) {
        response = t('support.timeResponse') || "Transactions are processed within minutes. If you experience any delays, please contact our support team.";
      } else {
        response = t('support.generalResponse') || "Thank you for your message. Our team will look into this and get back to you soon!";
      }
      
      setMessages(prev => [...prev, { text: response, fromUser: false }]);
    }, 1000);
  };

  // Chat penceresini minimize et
  const minimizeChat = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  // Destek penceresini kapat ve durumu sıfırla
  const closeSupport = () => {
    setIsOpen(false);
    setIsMinimized(false);
    
    // Konuşmanın kapatıldığını bildiren bir mesaj gösterebiliriz
    if (isChatStarted) {
      toast({
        title: t('support.chatClosed') || "Chat Closed",
        description: t('support.chatClosedDesc') || "Your support conversation has been closed. Thank you for contacting us!",
      });
    }
    
    // Chat durumunu sıfırla
    setTimeout(() => {
      setIsChatStarted(false);
      setMessages([]);
      setName("");
      setEmail("");
    }, 300);
  };

  return (
    <>
      {/* Minimized Chat Button */}
      {isMinimized && (
        <div 
          className="fixed bottom-4 right-4 bg-primary text-white rounded-full p-3 shadow-lg cursor-pointer hover:bg-primary/90 transition-all z-50"
          onClick={() => {
            setIsMinimized(false);
            setIsOpen(true);
          }}
        >
          <MessageCircle size={24} />
        </div>
      )}
      
      {/* Main Support Button */}
      {!isMinimized && !isOpen && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                className="fixed bottom-4 right-4 bg-primary hover:bg-primary/90 text-white rounded-full p-3 shadow-lg z-50 flex items-center gap-2" 
                onClick={() => setIsOpen(true)}
              >
                <MessageCircle size={20} />
                <span className="hidden sm:inline">{t('support.liveSupport') || "Live Support"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('support.getHelp') || "Get help from our support team"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Support Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle>{t('support.liveSupport') || "Live Support"}</DialogTitle>
              <DialogDescription>
                {t('support.liveSupportDesc') || "Our support team is here to help you."}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={minimizeChat} className="h-8 w-8">
                <span className="sr-only">{t('support.minimize') || "Minimize"}</span>
                <span className="h-1 w-4 bg-current rounded-sm" />
              </Button>
              <Button variant="ghost" size="icon" onClick={closeSupport} className="h-8 w-8">
                <span className="sr-only">{t('support.close') || "Close"}</span>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {!isChatStarted ? (
            // Chat başlatma formu
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name">{t('support.name') || "Name"}</label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder={t('support.enterName') || "Enter your name"}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email">{t('support.email') || "Email"}</label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder={t('support.enterEmail') || "Enter your email"}
                />
              </div>
              <Button onClick={startChat}>
                {t('support.startChat') || "Start Chat"}
              </Button>
            </div>
          ) : (
            // Chat alanı
            <>
              <div className="max-h-[300px] overflow-y-auto border rounded-md p-3 mb-4 bg-secondary/20">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`mb-2 p-2 rounded-lg max-w-[85%] ${
                      msg.fromUser 
                        ? 'ml-auto bg-primary text-primary-foreground' 
                        : 'mr-auto bg-secondary'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
              <DialogFooter className="flex sm:flex-row items-center">
                <Textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('support.typeMessage') || "Type your message..."}
                  className="flex-1 min-h-[60px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={sendMessage} 
                  className="ml-2"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}