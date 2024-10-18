import { Button } from "@/components/ui/button.tsx";
import { FormControl } from "@/components/ui/form.tsx";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar.tsx";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover.tsx";
import { isBefore } from "date-fns";

interface DatePickerPopoverProps {
    field: {
        value: Date | undefined;
        onChange: (date: Date | undefined) => void;
    };
    onSelect?: (date: Date) => void;
    disabled?: (date: Date) => boolean;
}

export default function DatePicker({field, onSelect, disabled}: DatePickerPopoverProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant="outline"
                        className="w-full text-left font-normal"
                    >
                        {field.value ? format(field.value, 'dd/MM/yyyy') :
                            <span className="truncate">Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                        {
                            if (date === undefined || onSelect == null) {
                                field.onChange(date)
                            } else {
                                onSelect(date)
                            }
                        }
                    }}
                    disabled={(date) => disabled ? disabled(date) : isBefore(date, new Date("1900-01-01"))}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
};

