import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/new/general/Checkbox";

interface TermsWithPopupProps {
  onChange?: (checked: boolean) => void;
}

export function TermsWithPopup({ onChange }: TermsWithPopupProps) {
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  function handleCheckedChange(newChecked: boolean) {
    setChecked(newChecked);
    if (onChange) onChange(newChecked);
  }

  // Fecha popup clicando fora
  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  // Swipe down para fechar (simples)
  const startY = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    const touch = e.touches?.[0];
    if (!touch) return;
    startY.current = touch.clientY;
  }

  function onTouchMove(e: React.TouchEvent) {
    const touch = e.touches?.[0];
    if (!touch) return;
    const currentY = touch.clientY;

    if (startY.current !== null && currentY - startY.current > 100) {
      setOpen(false);
      startY.current = null;
    }
  }

  return (
    <>
      <label
        className="flex items-center gap-2 max-w-md cursor-pointer select-none"
        style={{
          fontFamily: "Roboto, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "24px",
          color: "#1F2937",
        }}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={handleCheckedChange}
          className="w-6 h-6"
        />
        <span>
          Li e estou de acordo com os{" "}
          <button
            type="button"
            className="underline"
            style={{ color: "#3357E6" }}
            onClick={() => setOpen(true)}
          >
            Termos de Uso e Política de Privacidade
          </button>
        </span>
      </label>

      {open && (
        <div
          className="fixed inset-0 flex justify-center items-end bg-transparent z-[9999]"
          // Sem overlay escuro, só transparente para permitir clique fora
        >
          <div
            ref={popupRef}
            className="bg-white rounded-xl p-6 overflow-auto shadow-[0_10px_20px_rgba(0,0,0,0.25)] flex flex-col items-center"
            style={{
              width: 400,
              height: 500,
              maxWidth: "90vw",
              touchAction: "none",
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
          >
            {/* Retângulo pequeno arredondado */}
            <div
              className="mx-auto mb-4"
              style={{
                width: 40,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#BA2C5D",
              }}
            />

            <h2
              className="mb-2 font-semibold"
              style={{ color: "#0120AC", textAlign: "center", fontSize: 20 }}
            >
              Termos de Uso e Política de Privacidade
            </h2>
            <p
              style={{
                fontFamily: "Roboto, sans-serif",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: "24px",
                color: "#1F2937",
                textAlign: "center",
              }}
            >
              {/* Conteúdo dos termos */}
              Seu texto de termos aqui...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
