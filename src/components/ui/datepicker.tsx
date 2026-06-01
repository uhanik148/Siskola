'use client';

import { forwardRef, useEffect, useState } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
// CSS imported globally in layout.tsx to prevent hydration mismatch/order issues

// Register Indonesian locale
registerLocale('id', id);

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  showYearDropdown?: boolean;
  showMonthDropdown?: boolean;
  dateFormat?: string;
  className?: string;
  error?: boolean;
  isClearable?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, placeholder = 'Pilih tanggal', minDate, maxDate, disabled = false, showYearDropdown = true, showMonthDropdown = true, dateFormat = 'dd MMMM yyyy', className, error = false, isClearable = true }, ref) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 90 }, (_, i) => currentYear - 80 + i);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    if (!isMounted) {
      return (
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <CalendarIcon className="h-5 w-5 text-slate-400" />
          </div>
          <div className={cn('w-full h-12 pl-12 pr-10 rounded-xl border bg-slate-50 text-slate-900 border-slate-200 flex items-center', className)}>
            <span className={cn('text-sm font-medium', !value && 'text-slate-400')}>{value ? 'Memuat...' : placeholder}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <CalendarIcon className={cn('h-5 w-5 transition-colors', error ? 'text-red-400' : 'text-slate-400 group-hover:text-indigo-500')} />
        </div>

        <ReactDatePicker
          selected={value}
          onChange={onChange}
          customInputRef={ref as unknown as string}
          placeholderText={placeholder}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          dateFormat={dateFormat}
          locale="id"
          isClearable={isClearable && !disabled && !!value}
          showPopperArrow={false}
          popperPlacement="bottom-start"
          renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
            <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-100">
              <div className="flex items-center gap-1">
                {/* Month Select */}
                {showMonthDropdown && (
                  <div className="relative group/select cursor-pointer">
                    <select
                      value={months[date.getMonth()]}
                      onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                      className="appearance-none bg-transparent font-bold text-slate-800 text-sm cursor-pointer pr-4 pl-1 py-1 focus:outline-none hover:text-indigo-600 transition-colors z-10 relative"
                    >
                      {months.map((option) => (
                        <option key={option} value={option} className="text-slate-700">
                          {option}
                        </option>
                      ))}
                    </select>
                    {/* Add invisible overlay to expand click area if needed */}
                  </div>
                )}

                {/* Year Select */}
                {showYearDropdown && (
                  <div className="relative group/select cursor-pointer">
                    <select
                      value={date.getFullYear()}
                      onChange={({ target: { value } }) => changeYear(parseInt(value))}
                      className="appearance-none bg-transparent font-medium text-slate-600 text-sm cursor-pointer pr-4 pl-1 py-1 focus:outline-none hover:text-indigo-600 transition-colors z-10 relative"
                    >
                      {years.map((option) => (
                        <option key={option} value={option} className="text-slate-700">
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={decreaseMonth}
                  disabled={prevMonthButtonDisabled}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={increaseMonth}
                  disabled={nextMonthButtonDisabled}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          )}
          className={cn(
            'w-full h-12 pl-12 pr-10 rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer shadow-sm',
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-white',
            disabled && 'opacity-60 cursor-not-allowed bg-slate-100 hover:bg-slate-100 ring-0 hover:border-slate-200',
            className,
          )}
        />
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';
export default DatePicker;
