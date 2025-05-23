import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

export function Checkbox({ className, ...props }: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={` 
        w-5                
        bg-[#6D8AFF]           
        rounded-sm           
        flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className ?? ''}
      `}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="w-5 text-white" /> 
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
