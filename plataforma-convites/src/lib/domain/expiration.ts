import { TZDate } from "@date-fns/tz";

/** Validade do convite: exatamente 24 horas após o início do evento. */
export const INVITATION_VALIDITY_MS = 24 * 60 * 60 * 1000;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{2}):(\d{2})$/;

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz.includes("/") || tz === "UTC";
  } catch {
    return false;
  }
}

/**
 * Converte data/hora locais de um fuso IANA no instante UTC correspondente.
 * Rejeita datas inexistentes (ex.: 31/02) para não "rolar" para o mês seguinte.
 */
export function localToUtc(date: string, time: string, timeZone: string): Date {
  const d = DATE_RE.exec(date);
  const t = TIME_RE.exec(time);
  if (!d || !t) throw new Error("data_ou_hora_invalida");
  if (!isValidTimeZone(timeZone)) throw new Error("fuso_invalido");
  const [y, m, day] = [Number(d[1]), Number(d[2]), Number(d[3])];
  const [hh, mm] = [Number(t[1]), Number(t[2])];
  if (m < 1 || m > 12 || hh > 23 || mm > 59) throw new Error("data_ou_hora_invalida");
  const local = new TZDate(y, m - 1, day, hh, mm, 0, timeZone);
  if (local.getDate() !== day || local.getMonth() !== m - 1) throw new Error("data_ou_hora_invalida");
  return new Date(local.getTime());
}

export function computeExpiry(startsAt: Date): Date {
  return new Date(startsAt.getTime() + INVITATION_VALIDITY_MS);
}

export function isExpired(startsAt: Date, now: Date = new Date()): boolean {
  return now.getTime() >= computeExpiry(startsAt).getTime();
}
