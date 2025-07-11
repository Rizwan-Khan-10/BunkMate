import { useState } from 'react';
import { useSubject } from '../context/subject';
import { useTimeTable } from '../context/timeTable';
import { FiEdit, FiTrash } from 'react-icons/fi';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function TimeTable() {
  const { subjects } = useSubject();
  const { timeTable, updateTimeTable } = useTimeTable();

  const [selectedDay, setSelectedDay] = useState('monday');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [editIndex, setEditIndex] = useState(null);

  const resetFields = () => {
    setSelectedSubject('');
    setStartTime('');
    setEndTime('');
    setEditIndex(null);
  };

  const handleAddOrUpdate = () => {
    if (!selectedSubject || !startTime || !endTime) return;

    const updatedSlots = [...timeTable[selectedDay]];
    const newSlot = {
      subjectId: selectedSubject,
      startTime,
      endTime
    };

    if (editIndex !== null) {
      updatedSlots[editIndex] = newSlot;
    } else {
      updatedSlots.push(newSlot);
    }

    updateTimeTable(selectedDay, updatedSlots);
    resetFields();
  };

  const handleEdit = (index, slot) => {
    setEditIndex(index);
    setSelectedSubject(slot.subjectId);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
  };

  const handleDelete = (index) => {
    const updatedSlots = timeTable[selectedDay].filter((_, i) => i !== index);
    updateTimeTable(selectedDay, updatedSlots);
    resetFields();
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full p-4 text-gray-900 dark:text-white bg-blue-50 dark:bg-slate-900 overflow-y-auto">
      <h2 className="text-2xl sm:text-4xl font-bold my-6 text-center">Manage Timetable</h2>

      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-950 p-6 rounded-xl shadow">
        <h3 className="text-lg sm:text-xl text-center font-semibold mb-4">{editIndex !== null ? 'Update Slot' : 'Add New Slot'}</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="day" className="block text-sm font-medium mb-1">Select Day</label>
            <select
              id="day"
              value={selectedDay}
              onChange={(e) => {
                setSelectedDay(e.target.value);
                resetFields();
              }}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-slate-900 dark:text-white border-gray-300 dark:border-gray-600"
            >
              {days.map(day => (
                <option key={day} value={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">Select Subject</label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-slate-900 dark:text-white border-gray-300 dark:border-gray-600"
              required
            >
              <option value="">-- Select --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.shortCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="startTime" className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="time"
              id="startTime"
              autoComplete="off"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-slate-900 dark:text-white border-gray-300 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="time"
              id="endTime"
              autoComplete="off"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-slate-900 dark:text-white border-gray-300 dark:border-gray-600"
              required
            />
          </div>
        </div>

        <div className="flex justify-center mt-6 gap-3">
          <button
            onClick={handleAddOrUpdate}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition text-sm sm:text-base"
          >
            {editIndex !== null ? 'Update Slot' : 'Add Slot'}
          </button>
          {editIndex !== null && (
            <button
              onClick={resetFields}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-5">
        <h3 className="text-lg sm:text-xl text-center font-semibold mb-4">
          {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} Timetable
        </h3>

        {timeTable[selectedDay]?.length > 0 ? (
          <div className="space-y-3">
            {timeTable[selectedDay].map((slot, index) => {
              const subject = subjects.find((s) => s.id === slot.subjectId);
              return (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 border rounded-lg shadow bg-white dark:bg-slate-950 border-gray-200 dark:border-gray-700"
                >
                  <div>
                    <div className="font-semibold text-sm sm:text-base">{subject?.name || 'Unknown Subject'}</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                  <div className="flex gap-3 text-xl">
                    <button
                      onClick={() => handleEdit(index, slot)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm sm:text-base"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-rose-600 hover:text-rose-800 text-sm sm:text-base"
                    >
                      <FiTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-sm">No slots available for this day.</p>
        )}
      </div>
    </div>
  );
}

export default TimeTable;