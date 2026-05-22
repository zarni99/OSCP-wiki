import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { VariablesProvider } from "@/components/VariablesProvider";
import { ReportProvider } from "@/components/ReportProvider";

export const metadata: Metadata = {
  title: "oscp-wiki",
  description: "Local OSCP prep knowledge base",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-bg text-bright">
        <VariablesProvider>
          <ReportProvider>
            <Sidebar />
            <main className="ml-60 min-h-screen">
              <TopBar />
              <div className="p-6">{children}</div>
            </main>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#131c30",
                  color: "#eaf2ff",
                  border: "1px solid #223252",
                },
              }}
            />
          </ReportProvider>
        </VariablesProvider>
      </body>
    </html>
  );
}
