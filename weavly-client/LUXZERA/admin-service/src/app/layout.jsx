import "./globals.css";

export const metadata = {
  title: "LuxZera Executive Admin Studio",
  description: "Super Admin Curation & Control Center",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#FAFAF9] text-[#18181B] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
