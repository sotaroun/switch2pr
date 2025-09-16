import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-[#333c5e] text-white min-h-screen flex flex-col">
        {/* メインコンテンツ */}
        <main className="flex-1 p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
