

export const metadata = {
  title: "Bio Fold",
  description: "BioAI Research Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" >
      <body >
        {children}
      </body>
    </html>
  );
}