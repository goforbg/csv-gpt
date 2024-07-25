import "./globals.css";

export const metadata = {
  title: "CSV GPT",
  description: "Process CSV files with custom GPT prompts"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">{children}</body>
    </html>
  );
}
