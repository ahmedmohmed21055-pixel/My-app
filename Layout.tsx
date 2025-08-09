import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-main text-white">
      <header className="py-7 px-5 text-center border-b border-border-primary">
        <div className="text-4xl text-gold font-bold drop-shadow-lg shadow-gold">
          أبوالنور
        </div>
        <div className="text-text-muted mt-2">لوحة إدارة المتجر</div>
      </header>
      
      <main className="flex h-[calc(100vh-110px)] gap-3 p-3">
        {children}
      </main>
    </div>
  );
}