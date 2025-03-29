import { ReactNode } from "react";
import Header from "./header";
import Footer from "./footer";
import NewsTicker from "./news-ticker";
import MobileNavigation from "./mobile-navigation";

interface LayoutProps {
  children: ReactNode;
  showNewsTicker?: boolean;
}

export default function Layout({ children, showNewsTicker = true }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {showNewsTicker && <NewsTicker />}
      <main className="flex-grow">{children}</main>
      <Footer />
      <MobileNavigation />
    </div>
  );
}