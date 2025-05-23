interface IconBubbleProps {
  children: React.ReactNode;
  className?: string;
}

export function IconBubble({ children}: IconBubbleProps) {
  return (
    <div
      className="rounded-xl flex items-center justify-center" style={{ backgroundColor: "#E6EAFF" }}
    >
      {children}
    </div>
  );
}
