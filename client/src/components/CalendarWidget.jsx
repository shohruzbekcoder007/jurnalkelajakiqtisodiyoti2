import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCalendar } from '../api/client.js';
import { MONTHS, MONTHS_SHORT, WEEKDAYS_FULL, WEEKDAYS_SHORT } from '../utils/format.js';

// Reproduces the core/calendar block: Monday-first grid, days with posts link
// to the daily archive, today gets id="today", prev/next jump to months that
// actually have posts.
export default function CalendarWidget() {
  const today = new Date();
  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1
  });
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchCalendar(cursor.year, cursor.month)
      .then((d) => alive && setData(d))
      .catch(() => alive && setData(null));
    return () => {
      alive = false;
    };
  }, [cursor.year, cursor.month]);

  const { year, month } = cursor;
  const firstDay = new Date(year, month - 1, 1);
  // JS weeks start on Sunday; the theme's calendar starts on Monday
  const leading = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const withPosts = new Set(data?.days || []);

  const cells = [];
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  const weeks = [];
  let week = [];
  for (let i = 0; i < leading; i += 1) week.push(null);
  for (const d of cells) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const pad = (n) => String(n).padStart(2, '0');
  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();

  return (
    <div className="widget widget_block widget_calendar">
      <div className="wp-block-calendar">
        <table id="wp-calendar" className="wp-calendar-table">
          <caption>
            {MONTHS[month - 1]} {year}
          </caption>
          <thead>
            <tr>
              {WEEKDAYS_SHORT.map((w, i) => (
                <th key={w} scope="col" aria-label={WEEKDAYS_FULL[i]}>
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((row, ri) => {
              // Leading / trailing blanks are rendered as one padded cell,
              // exactly as the core calendar block does.
              const lead = ri === 0 ? row.filter((d) => d === null).length : 0;
              const trail =
                ri === weeks.length - 1 ? row.filter((d) => d === null).length : 0;
              const days = row.filter((d) => d !== null);
              return (
                <tr key={ri}>
                  {lead > 0 && (
                    <td colSpan={lead} className="pad">
                      &nbsp;
                    </td>
                  )}
                  {days.map((d) => (
                    <td key={d} id={isToday(d) ? 'today' : undefined}>
                      {withPosts.has(d) ? (
                        <Link
                          to={`/${year}/${pad(month)}/${pad(d)}`}
                          aria-label={`${pad(d)}.${pad(month)}.${year} sanasida chop etilgan maqolalar`}
                        >
                          {d}
                        </Link>
                      ) : (
                        d
                      )}
                    </td>
                  ))}
                  {trail > 0 && (
                    <td className="pad" colSpan={trail}>
                      &nbsp;
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        <nav aria-label="Avvalgi va keyingi oylar" className="wp-calendar-nav">
          <span className="wp-calendar-nav-prev">
            {data?.prev ? (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCursor(data.prev);
                }}
              >
                &laquo; {MONTHS_SHORT[data.prev.month - 1]}
              </a>
            ) : (
              <>&nbsp;</>
            )}
          </span>
          <span className="pad">&nbsp;</span>
          <span className="wp-calendar-nav-next">
            {data?.next ? (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCursor(data.next);
                }}
              >
                {MONTHS_SHORT[data.next.month - 1]} &raquo;
              </a>
            ) : (
              <>&nbsp;</>
            )}
          </span>
        </nav>
      </div>
    </div>
  );
}
