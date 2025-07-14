import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import { useTimeTable } from '../context/timeTable';
import { useAttendance } from '../context/attendance';
import { useSubject } from '../context/subject';
import { useToast } from '../context/ToastContext';

function Attendance() {
  const { timeTable } = useTimeTable();
  const { attendance, addAttendance } = useAttendance();
  const { subjects } = useSubject();
  const { showToast } = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editing, setEditing] = useState(false);
  const [customSlots, setCustomSlots] = useState([]);

  const getTimetableForDate = (date) => {
    const day = dayjs(date).format('dddd').toLowerCase();
    return timeTable[day] || [];
  };

  const getAttendanceForDate = (date) => {
    const formatted = dayjs(date).format('YYYY-MM-DD');
    return attendance.find((a) => a.date === formatted)?.records || null;
  };

  const handleMarkAll = (type) => {
    const updated = customSlots.map((slot) => ({ ...slot, attendance: type }));
    setCustomSlots(updated);
    showToast(`Marked all as ${type}`, 'success');
  };

  const handleConfirm = () => {
    const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
    const record = {};

    customSlots.forEach((slot) => {
      const subject = subjects.find((s) => s.id === slot.subjectId);
      const name = subject?.name || 'Unknown';
      const shortcode = subject?.shortCode || '';
      const startTime = slot.startTime || '';
      const endTime = slot.endTime || '';

      record[startTime + endTime] = {
        name,
        shortcode,
        status: slot.attendance,
        startTime,
        endTime,
      };
    });

    addAttendance(dateStr, record);
    showToast('Attendance saved successfully!', 'success');
  };

  useEffect(() => {
    loadSlotsForDate(new Date());
  }, []);

  const loadSlotsForDate = (date) => {
    setSelectedDate(date);
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const saved = attendance.find((a) => a.date === dateStr)?.records;

    if (saved) {
      const slots = Object.values(saved).map((rec) => {
        const subject = subjects.find((s) => s.shortCode === rec.shortcode || s.name === rec.name);
        return {
          subjectId: subject?.id || '',
          startTime: rec.startTime,
          endTime: rec.endTime,
          attendance: rec.status || 'Absent',
        };
      });
      setCustomSlots(slots);
    } else {
      const daySlots = getTimetableForDate(date).map((slot) => ({
        ...slot,
        attendance: 'Absent',
      }));
      setCustomSlots(daySlots);
    }

    setEditing(false);
  };

  const allPresent = customSlots.length > 0 && customSlots.every((s) => s.attendance === 'Present');
  const allAbsent = customSlots.length > 0 && customSlots.every((s) => s.attendance === 'Absent');

  return (
    <div className="min-h-[calc(100vh-5rem)] p-4 bg-blue-50 dark:bg-slate-900 text-gray-900 dark:text-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-4xl font-bold mb-6 text-center">Attendance Calendar</h2>

        <div className="bg-white dark:bg-slate-950 p-4 rounded-lg shadow-md flex justify-center items-center">
          <Calendar
            onClickDay={loadSlotsForDate}
            showFixedNumberOfWeeks
          />
        </div>

        {selectedDate && (
          <div className="mt-8 bg-white dark:bg-slate-950 p-6 rounded-xl shadow-md">
            <h3 className="text-base sm:text-xl text-center font-semibold mb-4">
              Attendance for {dayjs(selectedDate).format('MMMM D, YYYY')}
            </h3>

            {!editing && customSlots.length > 0 && (
              <div className="flex flex-wrap justify-center items-center sm:flex-row gap-4 mb-4">
                <button
                  onClick={() => handleMarkAll('Present')}
                  disabled={allPresent}
                  className={`px-4 py-2 text-sm sm:text-base border w-fit rounded text-white ${
                    allPresent ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleMarkAll('Absent')}
                  disabled={allAbsent}
                  className={`px-4 py-2 text-sm sm:text-base border w-fit rounded text-white ${
                    allAbsent ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Mark All Absent
                </button>
              </div>
            )}

            {!editing ? (
              customSlots.length === 0 ? (
                <p className="text-red-500 text-sm sm:text-base">No timetable or attendance available for this day.</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {customSlots.map((slot, idx) => {
                      const subject = subjects.find((s) => s.id === slot.subjectId);
                      return (
                        <div key={idx} className="flex justify-between items-center border px-4 py-3 rounded-lg dark:border-gray-700">
                          <div>
                            <div className="font-semibold text-sm sm:text-base">{subject?.name || 'Unknown'}</div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                          <select
                            id={`status-${idx}`}
                            autoComplete="off"
                            value={slot.attendance}
                            onChange={(e) => {
                              const updated = [...customSlots];
                              updated[idx].attendance = e.target.value;
                              setCustomSlots(updated);
                            }}
                            className="border text-sm sm:text-base px-2 py-1 rounded dark:bg-gray-700 dark:text-white"
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
                    <button
                      onClick={() => setEditing(true)}
                      className="text-blue-600 hover:underline text-sm sm:text-base"
                    >
                      Change timetable for this day
                    </button>

                    <button
                      onClick={handleConfirm}
                      className="bg-green-600 border text-white w-fit text-sm sm:text-base px-4 py-2 rounded hover:bg-green-700"
                    >
                      Confirm
                    </button>
                  </div>
                </>
              )
            ) : (
              <>
                <h4 className="text-base sm:text-lg text-center font-semibold mb-3">Edit Timetable</h4>

                {customSlots.map((slot, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-2 mb-3 border p-2 rounded-md">
                    <select
                      id={`subject-${index}`}
                      autoComplete="off"
                      value={slot.subjectId}
                      onChange={(e) => {
                        const updated = [...customSlots];
                        updated[index].subjectId = e.target.value;
                        setCustomSlots(updated);
                      }}
                      className="border px-2 py-1 rounded text-sm sm:text-base dark:bg-gray-700 dark:text-white"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="time"
                      id={`start-${index}`}
                      autoComplete="off"
                      value={slot.startTime}
                      onChange={(e) => {
                        const updated = [...customSlots];
                        updated[index].startTime = e.target.value;
                        setCustomSlots(updated);
                      }}
                      className="border px-2 py-1 text-sm sm:text-base rounded w-[100px] dark:bg-gray-700 dark:text-white"
                    />

                    <input
                      type="time"
                      id={`end-${index}`}
                      autoComplete="off"
                      value={slot.endTime}
                      onChange={(e) => {
                        const updated = [...customSlots];
                        updated[index].endTime = e.target.value;
                        setCustomSlots(updated);
                      }}
                      className="border px-2 py-1 text-sm sm:text-base rounded w-[100px] dark:bg-gray-700 dark:text-white"
                    />

                    <select
                      id={`status-edit-${index}`}
                      autoComplete="off"
                      value={slot.attendance}
                      onChange={(e) => {
                        const updated = [...customSlots];
                        updated[index].attendance = e.target.value;
                        setCustomSlots(updated);
                      }}
                      className="border px-2 py-1 text-sm sm:text-base rounded dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>

                    <button
                      onClick={() => {
                        const updated = [...customSlots];
                        updated.splice(index, 1);
                        setCustomSlots(updated);
                      }}
                      className="text-red-500 hover:underline text-sm sm:text-base"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  onClick={() =>
                    setCustomSlots([
                      ...customSlots,
                      {
                        subjectId: subjects[0]?.id || '',
                        startTime: '',
                        endTime: '',
                        attendance: 'Absent',
                      },
                    ])
                  }
                  className="text-blue-600 hover:underline text-sm sm:text-base mb-4"
                >
                  + Add Subject Slot
                </button>

                <div className="mt-2 flex justify-center items-center">
                  <button
                    onClick={() => {
                      setEditing(false);
                      showToast('Timetable updated for this day!', 'success');
                    }}
                    className="bg-blue-600 border text-sm sm:text-base text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Attendance;