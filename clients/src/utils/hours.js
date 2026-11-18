import { WORKSHOP } from '../config/site';

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Día y minuto actuales en la zona horaria del taller, sin depender de la zona del navegador. */
const nowInWorkshop = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: WORKSHOP.timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return { day: WEEKDAYS[get('weekday')], minutes: Number(get('hour')) * 60 + Number(get('minute')) };
};

export const getWorkshopStatus = (date = new Date()) => {
  const { day, minutes } = nowInWorkshop(date);
  const today = WORKSHOP.hours.find((slot) => slot.days.includes(day));
  const isOpen = Boolean(today && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close));
  return {
    isOpen,
    label: isOpen ? 'Taller abierto' : 'Taller cerrado',
    detail: isOpen ? `Hasta las ${today.close} hs` : 'Fuera de horario de atención'
  };
};
