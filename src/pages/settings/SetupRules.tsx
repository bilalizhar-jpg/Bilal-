import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useSettings, Language, Currency } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export default function SetupRules() {
  const {
    language, setLanguage, languages, addLanguage, updateLanguage, deleteLanguage,
    currency, setCurrency, currencies, addCurrency, updateCurrency, deleteCurrency,
    tax, setTax,
    timeZone, setTimeZone
  } = useSettings();

  const { theme, toggleTheme, colorPalette, setColorPalette, palettes } = useTheme();

  const [editingLang, setEditingLang] = useState<string | null>(null);
  const [editLangData, setEditLangData] = useState<Language>({ code: '', name: '' });
  const [newLang, setNewLang] = useState<Language>({ code: '', name: '' });
  const [showAddLang, setShowAddLang] = useState(false);

  const [editingCurr, setEditingCurr] = useState<string | null>(null);
  const [editCurrData, setEditCurrData] = useState<Currency>({ code: '', symbol: '', name: '' });
  const [newCurr, setNewCurr] = useState<Currency>({ code: '', symbol: '', name: '' });
  const [showAddCurr, setShowAddCurr] = useState(false);

  const handleSaveLang = () => {
    if (editingLang) {
      updateLanguage(editingLang, editLangData);
      setEditingLang(null);
    }
  };

  const handleAddLang = () => {
    if (newLang.code && newLang.name) {
      addLanguage(newLang);
      setNewLang({ code: '', name: '' });
      setShowAddLang(false);
    }
  };

  const handleSaveCurr = () => {
    if (editingCurr) {
      updateCurrency(editingCurr, editCurrData);
      setEditingCurr(null);
    }
  };

  const handleAddCurr = () => {
    if (newCurr.code && newCurr.symbol && newCurr.name) {
      addCurrency(newCurr);
      setNewCurr({ code: '', symbol: '', name: '' });
      setShowAddCurr(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Setup Rules</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure global application settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Languages Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Languages</h2>
              <button
                onClick={() => setShowAddLang(true)}
                className="text-sm flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Language
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Active Language</label>
                <select
                  value={language.code}
                  onChange={(e) => {
                    const selected = languages.find(l => l.code === e.target.value);
                    if (selected) setLanguage(selected);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Manage Languages</h3>
                <ul className="space-y-2">
                  {languages.map(lang => (
                    <li key={lang.code} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      {editingLang === lang.code ? (
                        <div className="flex items-center space-x-2 w-full">
                          <input
                            type="text"
                            value={editLangData.code}
                            onChange={e => setEditLangData({ ...editLangData, code: e.target.value })}
                            className="w-20 px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:text-white dark:border-gray-500"
                            placeholder="Code"
                          />
                          <input
                            type="text"
                            value={editLangData.name}
                            onChange={e => setEditLangData({ ...editLangData, name: e.target.value })}
                            className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:text-white dark:border-gray-500"
                            placeholder="Name"
                          />
                          <button onClick={handleSaveLang} className="p-1 text-green-600 hover:text-green-700"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditingLang(null)} className="p-1 text-gray-400 hover:text-gray-500"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-gray-900 dark:text-white">{lang.name} <span className="text-gray-500 dark:text-gray-400">({lang.code})</span></span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => { setEditingLang(lang.code); setEditLangData(lang); }}
                              className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteLanguage(lang.code)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              disabled={languages.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>

                {showAddLang && (
                  <div className="mt-3 flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <input
                      type="text"
                      value={newLang.code}
                      onChange={e => setNewLang({ ...newLang, code: e.target.value })}
                      className="w-20 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      placeholder="Code (e.g. de)"
                    />
                    <input
                      type="text"
                      value={newLang.name}
                      onChange={e => setNewLang({ ...newLang, name: e.target.value })}
                      className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      placeholder="Name (e.g. German)"
                    />
                    <button onClick={handleAddLang} className="p-1 text-green-600 hover:text-green-700"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setShowAddLang(false)} className="p-1 text-gray-400 hover:text-gray-500"><X className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Currencies Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Currencies</h2>
              <button
                onClick={() => setShowAddCurr(true)}
                className="text-sm flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Currency
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Active Currency</label>
                <select
                  value={currency.code}
                  onChange={(e) => {
                    const selected = currencies.find(c => c.code === e.target.value);
                    if (selected) setCurrency(selected);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  {currencies.map(curr => (
                    <option key={curr.code} value={curr.code}>{curr.name} ({curr.symbol})</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Manage Currencies</h3>
                <ul className="space-y-2">
                  {currencies.map(curr => (
                    <li key={curr.code} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      {editingCurr === curr.code ? (
                        <div className="flex items-center space-x-2 w-full">
                          <input
                            type="text"
                            value={editCurrData.code}
                            onChange={e => setEditCurrData({ ...editCurrData, code: e.target.value })}
                            className="w-16 px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:text-white dark:border-gray-500"
                            placeholder="Code"
                          />
                          <input
                            type="text"
                            value={editCurrData.symbol}
                            onChange={e => setEditCurrData({ ...editCurrData, symbol: e.target.value })}
                            className="w-12 px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:text-white dark:border-gray-500"
                            placeholder="Sym"
                          />
                          <input
                            type="text"
                            value={editCurrData.name}
                            onChange={e => setEditCurrData({ ...editCurrData, name: e.target.value })}
                            className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-600 dark:text-white dark:border-gray-500"
                            placeholder="Name"
                          />
                          <button onClick={handleSaveCurr} className="p-1 text-green-600 hover:text-green-700"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditingCurr(null)} className="p-1 text-gray-400 hover:text-gray-500"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm text-gray-900 dark:text-white">{curr.name} <span className="text-gray-500 dark:text-gray-400">({curr.code} - {curr.symbol})</span></span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => { setEditingCurr(curr.code); setEditCurrData(curr); }}
                              className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteCurrency(curr.code)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              disabled={currencies.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>

                {showAddCurr && (
                  <div className="mt-3 flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <input
                      type="text"
                      value={newCurr.code}
                      onChange={e => setNewCurr({ ...newCurr, code: e.target.value })}
                      className="w-16 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      placeholder="Code"
                    />
                    <input
                      type="text"
                      value={newCurr.symbol}
                      onChange={e => setNewCurr({ ...newCurr, symbol: e.target.value })}
                      className="w-12 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      placeholder="Sym"
                    />
                    <input
                      type="text"
                      value={newCurr.name}
                      onChange={e => setNewCurr({ ...newCurr, name: e.target.value })}
                      className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      placeholder="Name"
                    />
                    <button onClick={handleAddCurr} className="p-1 text-green-600 hover:text-green-700"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setShowAddCurr(false)} className="p-1 text-gray-400 hover:text-gray-500"><X className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tax & Time Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tax & Time Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Global Tax Rate (%)</label>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Zone</label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  {Intl.supportedValuesOf('timeZone').map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Mode</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`px-4 py-2 rounded-lg border ${theme === 'light' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300'}`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300'}`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Palette</label>
                <div className="flex flex-wrap gap-3">
                  {palettes.map(palette => (
                    <button
                      key={palette.id}
                      onClick={() => setColorPalette(palette.id)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${colorPalette === palette.id ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: palette.primary }}
                      title={palette.name}
                    >
                      {colorPalette === palette.id && <div className="w-3 h-3 bg-white rounded-full mix-blend-difference" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
