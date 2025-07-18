import { useState } from 'react';
import { useSubject } from '../context/SubjectContext';
import { v4 as uuidv4 } from 'uuid';
import { FiEdit, FiTrash } from 'react-icons/fi';

function Subject() {
  const { subjects, addSubject, removeSubject, updateSubject } = useSubject();

  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', shortCode: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !shortCode.trim()) return;

    const newSubject = {
      id: uuidv4(),
      name: name.trim(),
      shortCode: shortCode.trim(),
    };

    addSubject(newSubject);
    setName('');
    setShortCode('');
  };

  const handleEditSave = (id) => {
    updateSubject(id, editValues);
    setEditId(null);
    setEditValues({ name: '', shortCode: '', color: '#007bff' });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full p-4 text-gray-900 dark:text-white bg-blue-50 dark:bg-slate-900 overflow-y-auto">
      <h2 className="text-2xl sm:text-4xl font-bold my-6 text-center">Manage Subjects</h2>
      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-3 gap-4 bg-white dark:bg-slate-950 p-4 rounded-xl shadow"
      >
        <div>
          <label htmlFor='name' className="block text-sm sm:text-base font-semibold mb-1">Subject Name <span className='text-red-500'>*</span>
            <input
              type="text"
              id='name'
              autoComplete='off'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
              placeholder="e.g. Internal Programming"
              required
            />
          </label>
        </div>

        <div>
          <label htmlFor='inshort' className="block text-sm sm:text-base font-semibold mb-1">In Short <span className='text-red-500'>*</span>
            <input
              type="text"
              id='inshort'
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1 bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-600"
              placeholder="e.g. IP"
              required
            />
          </label>
        </div>

        <div className="w-full flex justify-center items-end mb-1">
          <button
            type="submit"
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full text-sm sm:text-base"
          >
            Add Subject
          </button>
        </div>
      </form>

      {subjects.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base sm:text-lg font-semibold mb-3">Your Subjects</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.map((subj) => (
              <div
                key={subj.id}
                className={`h-fit rounded-xl shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 ${editId === subj.id ? '' : 'flex justify-between items-center'
                  }`}
              >
                {editId === subj.id ? (
                  <div className="w-full space-y-3">
                    <label htmlFor={`edit-name-${subj.id}`} className="block text-sm font-medium">
                      Subject Name
                      <input
                        id={`edit-name-${subj.id}`}
                        type="text"
                        autoComplete="off"
                        value={editValues.name}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 mt-1"
                      />
                    </label>

                    <label htmlFor={`edit-short-${subj.id}`} className="block text-sm font-medium">
                      In Short
                      <input
                        id={`edit-short-${subj.id}`}
                        type="text"
                        autoComplete="off"
                        value={editValues.shortCode}
                        onChange={(e) => setEditValues({ ...editValues, shortCode: e.target.value })}
                        className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 mt-1"
                      />
                    </label>

                    <label htmlFor={`edit-color-${subj.id}`} className="block text-sm font-medium">
                      Color
                      <input
                        id={`edit-color-${subj.id}`}
                        type="color"
                        value={editValues.color}
                        onChange={(e) => setEditValues({ ...editValues, color: e.target.value })}
                        className="w-16 h-10 rounded block"
                      />
                    </label>

                    <div className="flex gap-3 mt-1">
                      <button
                        onClick={() => handleEditSave(subj.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block w-3 h-3 sm:w-5 sm:h-5 rounded-full"
                        style={{ backgroundColor: subj.color }}
                      />
                      <div>
                        <div className="font-medium text-sm sm:text-base">{subj.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{subj.shortCode}</div>
                      </div>
                    </div>
                    <div className="flex gap-3 text-lg">
                      <button
                        onClick={() => {
                          setEditId(subj.id);
                          setEditValues({
                            name: subj.name,
                            shortCode: subj.shortCode,
                            color: subj.color,
                          });
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm sm:text-base"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => removeSubject(subj.id)}
                        className="text-rose-600 hover:text-rose-800 text-sm sm:text-base"
                      >
                        <FiTrash />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Subject;