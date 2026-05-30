export const metadata = {
  title: "Zeriong Blog",
  description: "Next.js blog mounted at /blog",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
