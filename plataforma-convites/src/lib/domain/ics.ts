/**
 * Gera um arquivo de calendário (.ics, RFC 5545) para o convidado adicionar o evento à agenda.
 * Funciona em iPhone, Android, Google Agenda e Outlook. Todo o texto é escapado.
 */

export type IcsEvent = {
  uid: string;
  title: string;
  start: Date;
  durationHours?: number;
  location?: string;
  description?: string;
  url?: string;
  now?: Date;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Data em UTC no formato básico do iCalendar: 20261220T180000Z */
export function icsDate(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/** Escapa texto conforme a RFC 5545 (barra, ponto e vírgula, vírgula e quebras de linha). */
export function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Quebra linhas com mais de 75 octetos (dobra de linha da RFC 5545). */
function fold(line: string) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = "";
  let size = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (size + n > (out.length ? 74 : 75)) {
      out.push(current);
      current = "";
      size = 0;
    }
    current += ch;
    size += n;
  }
  out.push(current);
  return out.join("\r\n ");
}

export function buildIcs(e: IcsEvent) {
  const end = new Date(e.start.getTime() + (e.durationHours ?? 4) * 3600000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Festa no Link//Convites//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${icsEscape(e.uid)}`,
    `DTSTAMP:${icsDate(e.now ?? new Date())}`,
    `DTSTART:${icsDate(e.start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsEscape(e.title)}`,
    e.location ? `LOCATION:${icsEscape(e.location)}` : null,
    e.description ? `DESCRIPTION:${icsEscape(e.description)}` : null,
    e.url && /^https:\/\//.test(e.url) ? `URL:${icsEscape(e.url)}` : null,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(`Amanhã: ${e.title}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((l): l is string => l !== null);
  return lines.map(fold).join("\r\n") + "\r\n";
}
