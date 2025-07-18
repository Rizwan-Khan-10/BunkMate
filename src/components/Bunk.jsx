import { useEffect, useState } from "react";
import { useSubject } from "../context/SubjectContext";

function Bunk() {
  const { subjects } = useSubject();
  const [attendanceData, setAttendanceData] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});
  const [allSubjects, setAllSubjects] = useState([]);
  const [customSelected, setCustomSelected] = useState([]);
  const [inputMin, setInputMin] = useState("");
  const [minRequired, setMinRequired] = useState(75);
  const [testBunkHours, setTestBunkHours] = useState({});
  const [view, setView] = useState("Total");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("attendance")) || [];
    setAttendanceData(data);
    const storedMin = localStorage.getItem("minRequired");
    if (storedMin && !isNaN(Number(storedMin))) {
      setInputMin(storedMin);
      setMinRequired(Number(storedMin));
    } else {
      setInputMin("75");
      setMinRequired(75);
    }
  }, []);

  useEffect(() => {
    const num = parseFloat(inputMin);
    if (!isNaN(num)) {
      setMinRequired(num);
      localStorage.setItem("minRequired", num);
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

  const getSubjectCode = name => {
    const sub = subjects.find(s => s.name === name);
    return sub?.shortCode || name;
  };

  const CircularProgress = ({ value }) => {
    const color = value >= minRequired ? "stroke-green-400" : "stroke-red-400";
    return (
      <svg className="w-24 h-24 transform rotate-0" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          className="stroke-slate-300 dark:stroke-slate-700"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          className={`${color} transition-all duration-300`}
          strokeWidth="10"
          strokeDasharray="282.6"
          strokeDashoffset={`${282.6 - (value / 100) * 282.6}`}
          fill="none"
        />
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fontSize="18"
          fill="white"
          className="font-bold"
        >
          {value}%
        </text>
      </svg>
    );
  };

  const Card = ({ subj, data }) => {
  const [hoursToBunk, setHoursToBunk] = useState(String(testBunkHours[subj] ?? 0));

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setHoursToBunk(val);
      setTestBunkHours(prev => ({ ...prev, [subj]: Number(val || "0") }));
    }
  };

  const parsedHours = Number(hoursToBunk || "0");
  const updatedTotal = data.total + parsedHours;
  const updatedPercentage =
    updatedTotal > 0
      ? ((data.attended / updatedTotal) * 100).toFixed(1)
      : "N/A";

  const isCanBunk =
    (data.attended / data.total) * 100 >= minRequired &&
    updatedPercentage >= minRequired;

  const futureMaxBunks = (() => {
    let x = 0;
    while ((data.attended / (data.total + parsedHours + x)) * 100 >= minRequired) x++;
    return x - 1;
  })();

  const futureReqHrs = (() => {
    let x = 0;
    while (((data.attended + x) / (data.total + parsedHours + x)) * 100 < minRequired) x++;
    return x;
  })();

  const code = getSubjectCode(subj);
  const currentPct =
    data.total > 0 ? ((data.attended / data.total) * 100).toFixed(1) : "N/A";

  return (
    <div className="bg-white/10 dark:bg-slate-800/60 backdrop-blur-lg p-6 rounded-3xl shadow-lg w-[300px] border border-white/20 text-white flex flex-col items-center">
      <h3 className="text-xl font-semibold mb-2 text-center">{code}</h3>
      <CircularProgress value={parseFloat(currentPct)} />
      <div className="text-sm mt-4 text-center space-y-1">
        <p>Attended: {data.attended} hrs</p>
        <p>Total: {data.total} hrs</p>

        {isCanBunk ? (
          <p className="text-green-400">
            Can bunk <strong>{futureMaxBunks}</strong> hrs
          </p>
        ) : (
          <p className="text-red-400">
            Need to attend <strong>{futureReqHrs}</strong> hrs
          </p>
        )}

        <div className="flex flex-col items-center mt-2 text-center text-sm">
          <p className="mb-1">
            If you bunk{" "}
            <input
              id={`bunk-${subj}`}
              type="text"
              inputMode="numeric"
              value={hoursToBunk}
              onChange={handleInputChange}
              className="w-14 px-2 py-1 rounded bg-white/30 text-center mx-1 text-white"
            />
            hour(s)
          </p>
          <p>
            Then your attendance will be <strong>{updatedPercentage}%</strong>
          </p>
        </div>
      </div>
    </div>
  );
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-6 text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col justify-center gap-5 items-center mb-6">
          <div>
            <label htmlFor="min-required" className="mr-2">Minimum Required Percentage</label>
            <input
              id="min-required"
              type="text"
              value={inputMin}
              onChange={(e) => setInputMin(e.target.value)}
              className="w-16 px-2 py-1 rounded bg-white/80 dark:bg-slate-700 text-black dark:text-white text-center"
            />
          </div>
          <div className="flex gap-2">
            {["Total", "Custom", "Month"].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1 rounded-full text-sm capitalize font-medium ${view === v
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 dark:bg-slate-700 hover:bg-blue-300 dark:hover:bg-slate-600"
                  }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {view === "Month" && (
          <div className="space-y-12">
            {Object.entries(monthlyData).map(([mon, data]) => {
              const dates = data.dates.map(d => new Date(d));
              const from = new Date(Math.min(...dates)).toLocaleDateString(undefined, { month: "short", day: "numeric" });
              const to = new Date(Math.max(...dates)).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

              return (
                <div key={mon}>
                  <h2 className="text-3xl font-bold text-center mb-6">{mon} ({from} – {to})</h2>
                  <div className="flex flex-wrap justify-center gap-6">
                    {Object.entries(data.records).map(([subj, rec]) => (
                      <Card key={subj} subj={subj} data={rec} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "Total" && (
          <div className="flex justify-center mt-10">
            <Card
              subj="Total"
              data={Object.values(monthlyData).reduce(
                (acc, m) => {
                  Object.values(m.records).forEach(r => {
                    acc.attended += r.attended;
                    acc.total += r.total;
                  });
                  return acc;
                },
                { attended: 0, total: 0 }
              )}
            />
          </div>
        )}

        {view === "Custom" && (
          <div>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {allSubjects.map(sub => (
                <button
                  key={sub}
                  onClick={() =>
                    setCustomSelected(s =>
                      s.includes(sub) ? s.filter(x => x !== sub) : [...s, sub]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${customSelected.includes(sub)
                    ? "bg-blue-600 text-white"
                    : "bg-white/20 text-white border-white/30"
                    }`}
                >
                  {getSubjectCode(sub)}
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <Card
                subj="Custom"
                data={customSelected.reduce(
                  (acc, s) => {
                    Object.values(monthlyData).forEach(m => {
                      if (m.records[s]) {
                        acc.attended += m.records[s].attended;
                        acc.total += m.records[s].total;
                      }
                    });
                    return acc;
                  },
                  { attended: 0, total: 0 }
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Bunk;