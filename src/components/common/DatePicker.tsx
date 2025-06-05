import React from 'react';
import { Button } from "@/components/ui/button.tsx";
import { FormControl } from "@/components/ui/form.tsx";
import { CalendarIcon } from "lucide-react";
import { format, getMonth, getYear, isBefore, set } from "date-fns";
import { Calendar } from "@/components/ui/calendar.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select.tsx";

interface DatePickerPopoverProps {
  field: {
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
  };
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  className?: string; // Classe personalizada para o botão de entrada
  placeholderColor?: string; // Cor do placeholder
  iconColor?: string; // Cor do ícone do calendário
}

export default function DatePicker({ field, onSelect, disabled, className, placeholderColor = "#A6BBFF", iconColor = "#0120AC" }: DatePickerPopoverProps) {
  const [currentDate, setCurrentDate] = React.useState(field.value || new Date());

  const years = Array.from({ length: getYear(new Date()) - 1900 + 1 }, (_, i) => 1900 + i).reverse();

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handleMonthChange = (month: string) => {
    const newDate = set(currentDate, { month: months.indexOf(month) });
    setCurrentDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = set(currentDate, { year: parseInt(year) });
    setCurrentDate(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={className || "w-full text-left font-normal bg-white text-[#0120AC] placeholder:text-[#A6BBFF] hover:bg-white hover:text-[#0120AC] focus:bg-white focus:text-[#0120AC] border-[#A6BBFF]"}
          >
            {field.value ? format(field.value, 'dd/MM/yyyy') :
              <span className={`truncate text-xs text-[${placeholderColor}]`}>00/00/0000</span>}
            <CalendarIcon className={`ml-auto h-4 w-4 text-[${iconColor}]`} />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-[#A6BBFF]" align="start">
        <div className="flex items-center justify-between space-x-2 p-3 border-b border-[#A6BBFF]">
          {/* Month Select */}
          <Select
            value={months[getMonth(currentDate)]}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-[120px] border-[#A6BBFF] text-[#0120AC] focus:ring-0 focus:outline-none hover:bg-white">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {months.map((month) => (
                  <SelectItem key={month} value={month} className="hover:bg-[#A6BBFF] hover:text-white focus:bg-[#A6BBFF] focus:text-white data-[highlighted]:bg-[#A6BBFF] data-[highlighted]:text-white">
                    {month}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Year Select */}
          <Select
            value={getYear(currentDate).toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-[95px] border-[#A6BBFF] text-[#0120AC] focus:ring-0 focus:outline-none hover:bg-white">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="h-80">
              <SelectGroup>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="hover:bg-[#A6BBFF] hover:text-white focus:bg-[#A6BBFF] focus:text-white data-[highlighted]:bg-[#A6BBFF] data-[highlighted]:text-white">
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={field.value}
          onSelect={(date) => {
            if (date === undefined || onSelect == null) {
              field.onChange(date);
            } else {
              onSelect(date);
            }
          }}
          disabled={(date) => disabled ? disabled(date) : isBefore(date, new Date("1900-01-01"))}
          initialFocus
          month={currentDate}
          onMonthChange={setCurrentDate}
          className="p-3"
          classNames={{
            day_selected: "bg-[#0120AC] text-white hover:bg-[#0120AC] hover:text-white",
            day_today: "bg-[#A6BBFF]/20 text-[#0120AC]",
            day: "h-9 w-9 p-0 font-normal hover:bg-[#A6BBFF] hover:text-white",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-[#A6BBFF] hover:text-white border-[#A6BBFF]"
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
