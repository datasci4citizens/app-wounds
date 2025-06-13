import { cn } from '@/lib/utils';
import * as SliderPrimitive from '@radix-ui/react-slider';
import {
	type ComponentPropsWithoutRef,
	type ElementRef,
	forwardRef,
} from 'react';
// Componente PainSlider personalizado para o nível de dor
export const PainSlider = forwardRef<
	ElementRef<typeof SliderPrimitive.Root>,
	ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    value: number[];
  }
>(({ className, value, ...props }, ref) => {
  // Determinar o nível de dor atual para definir a cor
  const painLevel = value[0] ?? 0;
  
  // Determina a cor com base no nível de dor
  const getColorForPainLevel = (level: number) => {
    if (level === 0) return '#0120AC'; // Azul para 0 (valor inicial)
    if (level <= 4) return '#FFD700'; // Amarelo para 1-4
    if (level <= 7) return '#FFA500'; // Laranja para 5-7
    return '#FF0000'; // Vermelho para 8-10
  };
  
  const painColor = getColorForPainLevel(painLevel);
  
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range 
          className="absolute h-full" 
          style={{ backgroundColor: painColor }}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb 
        className="block h-5 w-5 rounded-full border-2 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" 
        style={{ borderColor: painColor }}
      />
    </SliderPrimitive.Root>
  );
});

PainSlider.displayName = 'PainSlider';

PainSlider.displayName = 'PainSlider';
