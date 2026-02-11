import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';

interface CalendarViewProps {
  onSelectDate: (date: string) => void;
}

export function CalendarView({ onSelectDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl p-5 w-full max-w-md mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-xl"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-display font-bold text-lg text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-xl"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const today = isToday(day);
          return (
            <motion.button
              key={dateStr}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(dateStr)}
              className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                today
                  ? 'gradient-primary text-primary-foreground font-bold shadow-md'
                  : 'hover:bg-accent/20 text-foreground'
              }`}
            >
              {format(day, 'd')}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
