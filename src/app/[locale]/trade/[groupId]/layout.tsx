export default function TradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt:pt-8 mx-auto min-h-[calc(100vh-100px)] w-full max-w-8xl px-4 pb-24 pt-8 md:px-8">
      {children}
    </div>
  );
}
