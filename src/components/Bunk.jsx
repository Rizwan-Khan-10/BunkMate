import { useEffect, useState } from "react";

function Bunk() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});
  const [allSubjects, setAllSubjects] = useState([]);
  const [customSelected, setCustomSelected] = useState([]);
  const [minRequired, setMinRequired] = useState(75);
  const [testBunkHours, setTestBunkHours] = useState({});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("attendance")) || [];
    setAttendanceData(data);
  }, []);

  useEffect(() => {
    const monthly = {};
    const subjectSet = new Set();

    attendanceData.forEach(({ date, records }) => {
      const month = new Date(date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!monthly[month]) monthly[month] = {};

      Object.entries(records).forEach(([_, record]) => {
        const subject = record.name;
        const duration = calculateLectureHours(record.startTime, record.endTime);

        if (!monthly[month][subject]) {
          monthly[month][subject] = { attended: 0, total: 0 };
        }

        monthly[month][subject].total += duration;
        if (record.status === "Present") {
          monthly[month][subject].attended += duration;
        }

        subjectSet.add(subject);
      });
    });

    setMonthlyData(monthly);
    const subjects = Array.from(subjectSet);
    setAllSubjects(subjects);
    setCustomSelected(subjects);
  }, [attendanceData]);

  const calculateLectureHours = (start, end) => {
    const getHour = (time) => parseInt(time.split(":")[0]);
    const startHour = getHour(start);
    const endHour = getHour(end);
    const start24 = startHour <= 6 ? startHour + 12 : startHour;
    const end24 = endHour <= 6 ? endHour + 12 : endHour;
    return end24 - start24;
  };

  const calculatePercentage = (attended, total) =>
    total > 0 ? ((attended / total) * 100).toFixed(2) : "N/A";

  const requiredHoursToReach = (attended, total) => {
    if ((attended / total) * 100 >= minRequired) return 0;
    let x = 0;
    while ((attended + x) / (total + x) * 100 < minRequired) x++;
    return x;
  };

  const maxBunkableHours = (attended, total) => {
    let x = 0;
    while ((attended / (total + x)) * 100 >= minRequired) x++;
    return x - 1;
  };

  const calculateBunkInfo = (attended, total, key) => {
    const extra = testBunkHours[key] || 1;
    const after = (attended / (total + extra)) * 100;
    const canBunk = (attended / total) * 100 >= minRequired && (attended / (total + extra)) * 100 >= minRequired;
    return {
      afterBunkPercent: after.toFixed(2),
      canBunk,
      bunkableHours: maxBunkableHours(attended, total),
    };
  };

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const totalSummary = { attended: 0, total: 0 };
  Object.values(monthlyData).forEach((month) => {
    Object.values(month).forEach(({ attended, total }) => {
      totalSummary.attended += attended;
      totalSummary.total += total;
    });
  });

  const customSubjects = customSelected.reduce(
    (acc, subject) => {
      Object.values(monthlyData).forEach((month) => {
        if (month[subject]) {
          acc.attended += month[subject].attended;
          acc.total += month[subject].total;
        }
      });
      return acc;
    },
    { attended: 0, total: 0 }
  );

  const invertSelection = () => {
    setCustomSelected(allSubjects.filter((s) => !customSelected.includes(s)));
  };

  return (
    <div className="p-6 text-gray-900 dark:text-white bg-blue-50 dark:bg-slate-900">
      <h1 className="text-3xl font-bold mb-4 text-center">Bunk Manager</h1>

      <div className="mb-6 text-center">
        <label htmlFor="minRequiredInput" className="text-sm font-medium">
          Minimum Required %
          <input
            id="minRequiredInput"
            type="number"
            autoComplete="off"
            value={minRequired}
            onChange={(e) => setMinRequired(Number(e.target.value))}
            className="ml-2 w-20 px-2 py-1 border rounded dark:bg-slate-900 dark:border-gray-600"
          />
        </label>
      </div>

      <h2 className="text-xl font-semibold mb-2">Current Month: {currentMonth}</h2>
      <div className="space-y-4 mb-8">
        {monthlyData[currentMonth] &&
          Object.entries(monthlyData[currentMonth]).map(([subject, { attended, total }]) => {
            const { afterBunkPercent, canBunk, bunkableHours } = calculateBunkInfo(attended, total, subject);
            const required = requiredHoursToReach(attended, total);
            const inputId = `bunk-${subject}`;

            return (
              <div key={subject} className="p-4 border rounded bg-white dark:bg-slate-800">
                <h3 className="font-semibold text-lg">{subject}</h3>
                <p>{attended} / {total} hrs ({calculatePercentage(attended, total)}%)</p>
                {canBunk ? (
                  <p className="text-blue-600">You can bunk up to <strong>{bunkableHours}</strong> hour(s)</p>
                ) : (
                  <p className="text-red-600">You should not bunk. Attend <strong>{required}</strong> more hour(s)</p>
                )}
                <label htmlFor={inputId}>
                  If you bunk:
                  <input
                    id={inputId}
                    autoComplete="off"
                    type="number"
                    value={testBunkHours[subject] || 1}
                    onChange={(e) =>
                      setTestBunkHours((prev) => ({
                        ...prev,
                        [subject]: parseInt(e.target.value),
                      }))
                    }
                    className="ml-2 w-16 px-2 py-1 border rounded dark:bg-slate-900"
                  />
                </label>
                <p className="mt-1">After bunking: <strong>{afterBunkPercent}%</strong></p>
              </div>
            );
          })}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Total Summary</h2>
        <div className="p-4 border rounded bg-white dark:bg-slate-800">
          <p><strong>Attended:</strong> {totalSummary.attended} hrs</p>
          <p><strong>Total:</strong> {totalSummary.total} hrs</p>
          <p><strong>Attendance:</strong> {calculatePercentage(totalSummary.attended, totalSummary.total)}%</p>
          {((totalSummary.attended / totalSummary.total) * 100 >= minRequired) ? (
            <p className="text-blue-600">You can bunk up to <strong>{maxBunkableHours(totalSummary.attended, totalSummary.total)}</strong> hour(s)</p>
          ) : (
            <p className="text-red-600">You need to attend <strong>{requiredHoursToReach(totalSummary.attended, totalSummary.total)}</strong> more hour(s)</p>
          )}
          <label htmlFor="bunk-total" className="block text-sm mt-2">
            If you bunk:
            <input
              id="bunk-total"
              autoComplete="off"
              type="number"
              value={testBunkHours["total"] || 1}
              onChange={(e) =>
                setTestBunkHours((prev) => ({
                  ...prev,
                  total: parseInt(e.target.value),
                }))
              }
              className="ml-2 w-16 px-2 py-1 border rounded dark:bg-slate-900"
            />
          </label>
          <p className="mt-1">
            Attendance after bunking: <strong>{calculateBunkInfo(totalSummary.attended, totalSummary.total, "total").afterBunkPercent}%</strong>
          </p>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Custom Attendance</h2>
        <div className="flex flex-wrap gap-3 mb-3">
          {allSubjects.map((subject) => (
            <label key={subject} htmlFor={`custom-${subject}`} className="flex items-center gap-2 text-sm">
              <input
                id={`custom-${subject}`}
                type="checkbox"
                checked={customSelected.includes(subject)}
                onChange={() =>
                  setCustomSelected((prev) =>
                    prev.includes(subject)
                      ? prev.filter((s) => s !== subject)
                      : [...prev, subject]
                  )
                }
              />
              {subject}
            </label>
          ))}
        </div>
        <button
          onClick={invertSelection}
          className="text-sm text-blue-600 underline mb-3"
        >
          Invert Selection
        </button>

        <div className="p-4 border rounded bg-white dark:bg-slate-800">
          <p><strong>Attended:</strong> {customSubjects.attended} hrs</p>
          <p><strong>Total:</strong> {customSubjects.total} hrs</p>
          <p><strong>Attendance:</strong> {calculatePercentage(customSubjects.attended, customSubjects.total)}%</p>
          {((customSubjects.attended / customSubjects.total) * 100 >= minRequired) ? (
            <p className="text-blue-600">You can bunk up to <strong>{maxBunkableHours(customSubjects.attended, customSubjects.total)}</strong> hour(s)</p>
          ) : (
            <p className="text-red-600">You need to attend <strong>{requiredHoursToReach(customSubjects.attended, customSubjects.total)}</strong> more hour(s)</p>
          )}
          <label htmlFor="bunk-custom" className="block text-sm mt-2">
            If you bunk:
            <input
              id="bunk-custom"
              autoComplete="off"
              type="number"
              value={testBunkHours["custom"] || 1}
              onChange={(e) =>
                setTestBunkHours((prev) => ({
                  ...prev,
                  custom: parseInt(e.target.value),
                }))
              }
              className="ml-2 w-16 px-2 py-1 border rounded dark:bg-slate-900"
            />
          </label>
          <p className="mt-1">
            Attendance after bunking: <strong>{calculateBunkInfo(customSubjects.attended, customSubjects.total, "custom").afterBunkPercent}%</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Bunk;