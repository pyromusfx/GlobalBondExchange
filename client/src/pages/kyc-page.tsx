import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNavigation from "@/components/layout/mobile-navigation";
import KycForm from "@/components/kyc/kyc-form";

export default function KycPage() {
  const { user } = useAuth();
  
  // Set page title
  useEffect(() => {
    document.title = "Sekance - KYC Verification";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
              <p className="text-muted-foreground">
                Complete the verification process to unlock full trading capabilities. 
                Your information is securely encrypted and protected.
              </p>
            </div>
            
            <KycForm />
            
            <div className="mt-8 bg-card p-6 rounded-lg">
              <h2 className="text-lg font-bold mb-4">Verification Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex">
                  <div className="bg-primary/20 rounded-full p-2 h-fit mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Enhanced Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Protect your account with verified identity information and prevent unauthorized access.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="bg-primary/20 rounded-full p-2 h-fit mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Higher Withdrawal Limits</h3>
                    <p className="text-sm text-muted-foreground">
                      Enjoy increased withdrawal limits and faster processing times for transactions.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="bg-primary/20 rounded-full p-2 h-fit mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Advanced Trading</h3>
                    <p className="text-sm text-muted-foreground">
                      Access high-leverage trading options up to 50x and participate in exclusive offerings.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="bg-primary/20 rounded-full p-2 h-fit mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Compliance & Trust</h3>
                    <p className="text-sm text-muted-foreground">
                      Trade with confidence on a platform that meets regulatory requirements and protects users.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileNavigation />
    </div>
  );
}
