import { Header, Footer } from "@/components/frontend/layout";

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="relative flex-grow pt-16 min-h-[60vh]">{children}</main>
      <Footer />
    </div>
  );
}
