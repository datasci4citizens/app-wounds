import React from 'react';
import { Button } from "@/components/ui/button.tsx";
import { FormControl } from "@/components/ui/form.tsx";
import { CalendarIcon } from "lucide-react";
import { format, getMonth, getYear, isBefore, set } from "date-fns";
import { Calendar } from "@/components/ui/calendar.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

interface DatePickerPopoverProps {
  field: {
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
  };
  onSelect?: (date: Date) => void;
  disabled?: (date: Date) => boolean;
}

export default function DatePicker({ field, onSelect, disabled }: DatePickerPopoverProps) {
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
            className="w-full text-left font-normal bg-white text-[#0120AC] placeholder:text-[#A6BBFF] "
          >
            {field.value ? format(field.value, 'dd/MM/yyyy') :
              <span className="truncate text-xs text-[#A6BBFF]">00/00/0000</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex items-center justify-between space-x-2 p-3 border-b">
          {/* Month Select */}
          <Select
            value={months[getMonth(currentDate)]}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year Select */}
          <Select
            value={getYear(currentDate).toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-[95px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="h-80">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
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
        />
      </PopoverContent>
    </Popover>
  );
}
