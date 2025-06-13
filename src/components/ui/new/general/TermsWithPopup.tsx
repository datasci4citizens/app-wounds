import { useState, useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/new/general/Checkbox";

interface TermsWithPopupProps {
  onChange?: (checked: boolean) => void;
  onNext?: () => void;
}

export function TermsWithPopup({ onChange }: TermsWithPopupProps) {
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  function handleCheckedChange(newChecked: boolean) {
    setChecked(newChecked);
    if (onChange) onChange(newChecked);
  }

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
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 max-w-md w-full">
        <div className="flex-shrink-0 w-[18px] h-[18px]">
          <Checkbox
            checked={checked}
            onCheckedChange={handleCheckedChange}
            className="w-[18px] h-[18px] min-w-[18px] min-h-[18px] border border-[#E7E5E4]"
          />
        </div>
          <label className="cursor-pointer select-none flex-grow text-sm font-normal text-black font-normal">
            <span
              className="text-black"
              onClick={() => setOpen(true)}
            >
              Li e estou de acordo com os{" "}
              <span
                className="text-[#6D8AFF] underline underline-offset-2"
              >
                Termos de Uso e Política de Privacidade
              </span>
            </span>
          </label>
      </div>

      {open && (
        <div className="fixed inset-0 flex justify-center items-end bg-transparent z-[9999]">
          <div
            ref={popupRef}
            className="w-full max-w-[360px] h-[60vh] touch-none p-6 pt-5 pb-6 px-5 overflow-auto bg-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex flex-col items-center"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            {/* Barra de fechamento */}
            <div className="mx-auto mb-4 w-8 h-1 rounded-full bg-[#BA2C5D]" />

            <h2 className="mb-2 font-semibold text-center text-[20px] text-[#0120AC]">
              Termos de Uso e Política de Privacidade
            </h2>

            <div className="w-full max-h-[calc(75vh-100px)] overflow-y-auto text-left text-[14px] leading-[22px] text-[#1F2937] font-normal">
              {/* Conteúdo dos termos */}
              Seu texto de termos aqui...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
