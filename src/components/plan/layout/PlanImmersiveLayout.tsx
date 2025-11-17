import { ReactNode, useEffect } from "react";

interface PlanImmersiveLayoutProps {
  children: ReactNode;
  topRef: React.RefObject<HTMLDivElement>;
}

const PlanImmersiveLayout = ({
  children,
  topRef,
}: PlanImmersiveLayoutProps) => {
  // Lock body scroll when immersive layout is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-white z-[9999]">
      <div ref={topRef}></div>

      {/* Animated background gradients - subtle */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs - very subtle */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-brand-purple/5 via-brand-pink/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-brand-pink/5 via-brand-gold/3 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[550px] h-[550px] bg-gradient-to-tr from-brand-gold/5 via-brand-purple/3 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content container - full viewport, no scrolling */}
      <div className="relative z-10 w-full h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default PlanImmersiveLayout;
