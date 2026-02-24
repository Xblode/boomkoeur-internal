'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { PageToolbar, PageToolbarFilters, PageToolbarActions } from '@/components/ui/organisms';
import { Button, IconButton } from '@/components/ui/atoms';
import { useCalendarDataContext } from '@/components/providers/CalendarDataProvider';
import Link from 'next/link';
import { CALENDAR_EVENT_COLORS } from '@/lib/constants/chart-colors';

const dotColors: Record<string, string> = CALENDAR_EVENT_COLORS;
const typeLabels: Record<string, string> = {
  event: 'Événement',
  meeting: 'Réunion',
  post: 'Post',
  google_calendar: 'Google Calendar',
};

export const CalendarView: React.FC = () => {
  const { items: calendarItems, isLoading, currentDate, setCurrentDate } = useCalendarDataContext();
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const { setToolbar } = useToolbar();

  // ── Calcul du calendrier ──

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const emptyDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const getItemsForDate = (date: Date) =>
    calendarItems.filter((item) => isSameDay(item.date, date));

  const selectedDateItems = mounted ? getItemsForDate(selectedDate) : [];
  const hoveredDateItems = mounted && hoveredDate ? getItemsForDate(hoveredDate) : [];

  // ── Navigation ──

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const todayMonth = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // ── Interactions ──

  const handleDayMouseEnter = (day: Date, e: React.MouseEvent) => {
    const dayItems = getItemsForDate(day);
    if (dayItems.length > 0) {
      setHoveredDate(day);
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDayMouseMove = (e: React.MouseEvent) => {
    if (hoveredDate) setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleDayMouseLeave = () => setHoveredDate(null);

  // ── Toolbar ──

  useEffect(() => {
    setToolbar(
      <PageToolbar
        filters={
          <PageToolbarFilters>
            <h2 className="text-sm font-bold uppercase text-white tracking-wide">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            <div className="flex items-center gap-1">
              <IconButton
                icon={<ChevronLeft size={16} />}
                ariaLabel="Mois précédent"
                variant="ghost"
                size="sm"
                onClick={previousMonth}
                className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              />
              <IconButton
                icon={<ChevronRight size={16} />}
                ariaLabel="Mois suivant"
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              />
            </div>
          </PageToolbarFilters>
        }
        actions={
          <PageToolbarActions>
            <Button onClick={todayMonth}>Aujourd&apos;hui</Button>
          </PageToolbarActions>
        }
      />
    );
    return () => setToolbar(null);
  }, [currentDate, setToolbar]);

  // ── Render ──

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Chargement du calendrier...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* Calendrier plein écran */}
      <div className="flex-1 p-4 md:p-6">

        {/* En-têtes des jours */}
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="text-center text-xs uppercase text-zinc-500 dark:text-zinc-400 py-2 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-1.5 flex-1">
          {Array.from({ length: emptyDays }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[90px]" />
          ))}

          {daysInMonth.map((day) => {
            const dayItems = mounted ? getItemsForDate(day) : [];
            const hasItems = dayItems.length > 0;
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={format(day, 'yyyy-MM-dd')}
                className={cn(
                  'min-h-[90px] border rounded-lg p-2 relative cursor-pointer transition-all',
                  isToday(day) && 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
                  !isToday(day) && 'border-zinc-200 dark:border-zinc-700',
                  isSelected && 'ring-1 ring-blue-400 ring-offset-1 dark:ring-offset-zinc-900',
                  hasItems && 'hover:border-blue-400 dark:hover:border-blue-500',
                  !isSameMonth(day, currentDate) && 'opacity-30'
                )}
                onMouseEnter={(e) => handleDayMouseEnter(day, e)}
                onMouseMove={handleDayMouseMove}
                onMouseLeave={handleDayMouseLeave}
                onClick={() => setSelectedDate(day)}
              >
                <div className={cn(
                  'text-sm font-medium mb-1',
                  isToday(day) && 'text-blue-600 dark:text-blue-400 font-bold'
                )}>
                  {format(day, 'd')}
                </div>

                {hasItems && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dayItems.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: dotColors[item.type] ?? '#71717a' }}
                        title={item.title}
                      />
                    ))}
                    {dayItems.length > 4 && (
                      <span className="text-[9px] text-zinc-400 leading-none">+{dayItems.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-wrap gap-4">
            {Object.entries(typeLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColors[key] }} />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip au survol */}
      {hoveredDate && hoveredDateItems.length > 0 && (
        <div
          className="fixed z-50 bg-white dark:bg-zinc-900 border border-border-custom rounded-lg p-3 shadow-2xl pointer-events-none max-w-xs"
          style={{
            left: `${mousePosition.x + 12}px`,
            top: `${mousePosition.y + 12}px`,
          }}
        >
          <div className="space-y-2">
            <div className="text-xs uppercase text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
              {format(hoveredDate, 'dd MMMM yyyy', { locale: fr })}
            </div>
            {hoveredDateItems.map((item) => (
              <div key={item.id} className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColors[item.type] ?? '#71717a' }} />
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                {item.time && (
                  <div className="flex items-center gap-1.5 text-xs pl-4 text-zinc-500">
                    <Clock size={10} />
                    {item.time}
                  </div>
                )}
                {item.location && (
                  <div className="flex items-center gap-1.5 text-xs pl-4 text-zinc-500">
                    <MapPin size={10} />
                    {item.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail panel pour date sélectionnée (bas du calendrier) */}
      {selectedDateItems.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 md:px-6 py-4">
          <h3 className="text-sm font-semibold mb-3 capitalize">
            {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
            <span className="text-zinc-400 font-normal ml-2">
              ({selectedDateItems.length} élément{selectedDateItems.length !== 1 ? 's' : ''})
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedDateItems.map((item) => {
              const isExternal = item.href?.startsWith('http');
              const linkClassName = 'flex items-start gap-2.5 p-2.5 rounded-lg border border-border-custom hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors';
              return item.href ? (
                isExternal ? (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClassName}
                  >
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: dotColors[item.type] ?? '#71717a' }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-zinc-400">{typeLabels[item.type] ?? item.type}</span>
                        {item.time && <><span className="text-[10px] text-zinc-400">·</span><span className="text-[10px] text-zinc-400">{item.time}</span></>}
                        {item.location && <><span className="text-[10px] text-zinc-400">·</span><span className="text-[10px] text-zinc-400 truncate">{item.location}</span></>}
                      </div>
                    </div>
                  </a>
                ) : (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={linkClassName}
                  >
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: dotColors[item.type] ?? '#71717a' }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-zinc-400">{typeLabels[item.type] ?? item.type}</span>
                        {item.time && <><span className="text-[10px] text-zinc-400">·</span><span className="text-[10px] text-zinc-400">{item.time}</span></>}
                        {item.location && <><span className="text-[10px] text-zinc-400">·</span><span className="text-[10px] text-zinc-400 truncate">{item.location}</span></>}
                      </div>
                    </div>
                  </Link>
                )
              ) : (
                <div
                  key={item.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border-custom hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: dotColors[item.type] ?? '#71717a' }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-zinc-400">{typeLabels[item.type] ?? item.type}</span>
                      {item.time && <><span className="text-[10px] text-zinc-400">·</span><span className="text-[10px] text-zinc-400">{item.time}</span></>}
                      {item.location && <><span className="text-[10px] text-zinc-400">·</span><span className="text-[10px] text-zinc-400 truncate">{item.location}</span></>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
