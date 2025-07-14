import { useEffect, useState } from "react";
import { useSubject } from "../context/subject";

function Bunk() {
  const { subjects } = useSubject();
  const [attendanceData, setAttendanceData] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});
  const [allSubjects, setAllSubjects] = useState([]);
  const [customSelected, setCustomSelected] = useState([]);
  const [inputMin, setInputMin] = useState("75");
  const [minRequired, setMinRequired] = useState(75);
  const [testBunkHours, setTestBunkHours] = useState({});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("attendance")) || [];
    setAttendanceData(data);
  }, []);

  useEffect(() => {
    const num = parseFloat(inputMin);
    if (!isNaN(num)) {
      setMinRequired(num);
    }
  }, [inputMin]);

  useEffect(() => {
    const monthly = {};
    const subjectSet = new Set();
    attendanceData.forEach(({ date, records }) => {
      const dt = new Date(date);
      const mon = dt.toLocaleString("default", { month: "long", year: "numeric" });
      if (!monthly[mon]) monthly[mon] = { records: {}, dates: [] };
      monthly[mon].dates.push(date);
      Object.values(records).forEach(r => {
        subjectSet.add(r.name);
        const dur = getHours(r.startTime, r.endTime);
        const prev = monthly[mon].records[r.name] || { attended: 0, total: 0 };
        prev.total += dur;
        if (r.status === "Present") prev.attended += dur;
        monthly[mon].records[r.name] = prev;
      });
    });
    setMonthlyData(monthly);
    const subs = Array.from(subjectSet);
    setAllSubjects(subs);
    setCustomSelected(subs);
  }, [attendanceData]);

  const getHours = (s, e) => {
    const h1 = parseInt(s.split(":")[0]);
    const h2 = parseInt(e.split(":")[0]);
    const s24 = h1 <= 6 ? h1 + 12 : h1;
    const e24 = h2 <= 6 ? h2 + 12 : h2;
    return e24 - s24;
  };

  const pct = (a, t) => (t > 0 ? ((a / t) * 100).toFixed(2) : "N/A");

  const reqHrs = (a, t) => {
    if (t === 0 || (a / t) * 100 >= minRequired) return 0;
    let x = 0;
    while (((a + x) / (t + x)) * 100 < minRequired) x++;
    return x;
  };

  const maxBunks = (a, t) => {
    let x = 0;
    while (t + x === 0 || (a / (t + x)) * 100 >= minRequired) x++;
    return x - 1;
  };

  const bunkInfo = (a, t, k) => {
    const extra = testBunkHours[k] || 1;
    const after = (a / (t + extra)) * 100;
    const can = a / t * 100 >= minRequired && after >= minRequired;
    return { after: after.toFixed(2), can, max: maxBunks(a, t) };
  };

  const isLight = hex => {
    const c = hex.slice(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff, g = (rgb >> 8) & 0xff, b = rgb & 0xff;
    return 0.299 * r + 0.587 * g + 0.114 * b > 180;
  };

  const colorFor = name => subjects.find(s => s.name === name)?.color || "#ddd";
  const invert = () => setCustomSelected(allSubjects.filter(s => !customSelected.includes(s)));

  const onMinChange = (val) => {
    setInputMin(val);
    const num = val.trim() === "" ? null : Number(val);
    if (!isNaN(num)) setMinRequired(num);
  };

  return (
    <div className="p-6 bg-blue-50 dark:bg-slate-900 text-gray-900 dark:text-white">
      <div className="text-center mb-8">
        <label className="text-sm font-medium mr-2">Minimum Required %</label>
        <input
          type="text"
          inputMode="numeric"
          value={inputMin}
          onChange={(e) => setInputMin(e.target.value)}
          placeholder="75"
          className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring"
        />
      </div>

      {Object.entries(monthlyData).map(([mon, data]) => {
        const dates = data.dates.map(d => new Date(d));
        const from = dates.length
          ? new Date(Math.min(...dates)).toLocaleDateString("default", { month: "short", day: "numeric" })
          : "";
        const to = dates.length
          ? new Date(Math.max(...dates)).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })
          : "";
        const total = { attended: 0, total: 0 };
        Object.values(data.records).forEach(r => {
          total.attended += r.attended;
          total.total += r.total;
        });
        const custom = customSelected.reduce((c, s) => {
          if (data.records[s]) {
            c.attended += data.records[s].attended;
            c.total += data.records[s].total;
          }
          return c;
        }, { attended: 0, total: 0 });

        return (
          <div key={mon} className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">{mon} ({from} – {to})</h2>

            <div className="flex flex-wrap gap-5 mb-6">
              {Object.entries(data.records).map(([subj, rec]) => {
                const info = bunkInfo(rec.attended, rec.total, subj);
                const req = reqHrs(rec.attended, rec.total);
                const bg = colorFor(subj);
                const tc = isLight(bg) ? "text-black" : "text-white";
                return (
                  <div key={subj} className={`w-[300px] p-5 rounded-lg shadow-lg ${tc}`} style={{ backgroundColor: bg }}>
                    <h3 className="font-bold text-lg mb-2">{subj}</h3>
                    <p className="text-sm mb-1">Attended: {rec.attended} hrs</p>
                    <p className="text-sm mb-1">Total: {rec.total} hrs</p>
                    <p className="text-sm mb-2">Attendance: {pct(rec.attended, rec.total)}%</p>
                    {info.can
                      ? <p className="text-sm mb-1">You can bunk up to <strong>{info.max}</strong> hr(s)</p>
                      : <p className="text-sm mb-1">Attend <strong>{req}</strong> more hr(s) to meet the minimum attendance requirement. </p>}
                    <div className="mt-2">
                      <label className="text-sm block">If you bunk:
                        <input
                          type="number"
                          value={testBunkHours[subj] || 1}
                          onChange={e => setTestBunkHours(p => ({ ...p, [subj]: parseInt(e.target.value) }))}
                          className="mx-2 mt-1 w-16 px-2 py-1 text-sm rounded border"
                        />
                        hour</label>
                      <p className="text-sm mt-1">Your Attendace will be <strong>{info.after}%</strong></p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mb-6 w-[300px] mx-auto p-5 rounded-lg shadow-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-white">
              <h3 className="font-bold text-lg mb-2">Total Summary</h3>
              <p className="text-sm mb-1">Attended: {total.attended} hrs</p>
              <p className="text-sm mb-1">Total: {total.total} hrs</p>
              <p className="text-sm mb-2">Attendance: {pct(total.attended, total.total)}%</p>
              {total.total > 0 && (total.attended / total.total * 100 >= minRequired
                ? <p className="text-sm text-green-600 mb-2">You can bunk up to <strong>{maxBunks(total.attended, total.total)}</strong> hr(s)</p>
                : <p className="text-sm text-red-600 mb-2">Attend <strong>{reqHrs(total.attended, total.total)}</strong> more hr(s) to meet the minimum attendance requirement.</p>)}
              <label className="text-sm block">If you bunk:
                <input
                  type="number"
                  value={testBunkHours["total"] || 1}
                  onChange={e => setTestBunkHours(p => ({ ...p, total: parseInt(e.target.value) }))}
                  className="mx-2 mt-1 w-16 px-2 py-1 text-sm rounded border"
                />
                hour</label>
              <p className="text-sm mt-1">Your Attendace will be <strong>{bunkInfo(total.attended, total.total, "total").after}%</strong></p>
            </div>

            <div className="w-[300px] mx-auto p-5 rounded-lg shadow-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
              <h3 className="font-bold text-lg mb-2">Custom Attendance</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {allSubjects.map(s => (
                  <label key={s} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={customSelected.includes(s)}
                      onChange={() => setCustomSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                    />
                    {s}
                  </label>
                ))}
              </div>
              <button onClick={invert} className="text-sm underline mb-3">Invert Selection</button>
              <p className="text-sm mb-1">Attended: {custom.attended} hrs</p>
              <p className="text-sm mb-1">Total: {custom.total} hrs</p>
              <p className="text-sm mb-2">Attendance: {pct(custom.attended, custom.total)}%</p>
              {custom.total > 0 && (custom.attended / custom.total * 100 >= minRequired
                ? <p className="text-sm text-green-600 mb-2">You can bunk up to <strong>{maxBunks(custom.attended, custom.total)}</strong> hr(s)</p>
                : <p className="text-sm text-red-600 mb-2">Attend <strong>{reqHrs(custom.attended, custom.total)}</strong> more hr(s) to meet the minimum attendance requirement.</p>)}
              <label className="text-sm block">If you bunk:
                <input
                  type="number"
                  value={testBunkHours["custom"] || 1}
                  onChange={e => setTestBunkHours(p => ({ ...p, custom: parseInt(e.target.value) }))}
                  className="mx-2 mt-1 w-16 px-2 py-1 text-sm rounded border"
                />
                hour</label>
              <p className="text-sm mt-1">Your Attendace will be <strong>{bunkInfo(custom.attended, custom.total, "custom").after}%</strong></p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Bunk;