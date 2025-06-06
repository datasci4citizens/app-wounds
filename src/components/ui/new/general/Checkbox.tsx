import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

export function Checkbox({ className, ...props }: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={`
        w-6
        h-6
        rounded-sm
        flex items-center justify-center
        transition-colors
        bg-white
        data-[state=checked]:bg-[#6D8AFF]
        data-[state=checked]:outline-none
        border
        border-[#A6BBFF]
        ${className ?? ''}
      `}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="w-4 h-4 text-white" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
