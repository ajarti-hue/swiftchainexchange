import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface Ctx {
  goWithLoader: (to: string, label?: string) => void;
}
const NavLoaderCtx = createContext<Ctx>({ goWithLoader: () => {} });
export const useNavLoader = () => useContext(NavLoaderCtx);

export const NavLoaderProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("Loading");

  const goWithLoader = useCallback((to: string, l = "Loading") => {
    setLabel(l);
    setVisible(true);
    const delay = 1800 + Math.random() * 700; // 1.8–2.5s
    window.setTimeout(() => {
      navigate(to);
    }, delay);
  }, [navigate]);

  // Hide loader shortly after route mounts
  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(t);
  }, [visible]);

  return (
    <NavLoaderCtx.Provider value={{ goWithLoader }}>
      {children}
      {visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md animate-fade-in">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-8 py-6 shadow-2xl">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-4 border-primary/20" />
              <Loader2 className="absolute inset-0 m-auto h-14 w-14 animate-spin text-primary" strokeWidth={1.5} />
            </div>
            <p className="font-display text-sm font-semibold text-foreground">{label}</p>
            <p className="text-[11px] text-muted-foreground">Preparing the freshest rates…</p>
          </div>
        </div>
      )}
    </NavLoaderCtx.Provider>
  );
};
