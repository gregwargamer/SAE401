import React from "react";

/*jespere juse pas faire de  la merde en ajustant*/
const sel = "w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 bg-white outline-none focus:border-indigo-400 cursor-pointer";
const btnBase = "w-full py-1.5 text-xs font-medium rounded-md transition-colors";
const btnActive = `${btnBase} bg-[#1f2a2e] text-white`;
const btnInactive = `${btnBase} bg-white text-slate-600 border border-slate-300 hover:bg-slate-50`;

const Label = ({ children }) => (
  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{children}</p>
);

const SidebarComparateurMap = ({ dep1Code, setDep1Code, dep2Code, setDep2Code, depList, selectedYear, setSelectedYear, years }) => {
  return (
    <aside className="static xl:fixed top-0 left-0 w-full xl:w-[20%] h-auto xl:h-screen bg-[#fafaf8] text-[#374151] border-b xl:border-r xl:border-b-0 border-[#e5e7eb] p-5 overflow-y-auto z-20 flex flex-col">
      <h2 className="text-lg font-extrabold tracking-widest text-[#111827] mb-4 border-b border-[#d1d5db] pb-2.5 uppercase text-center xl:text-left mt-2 xl:mt-0">
        COMPARATEUR
      </h2>

      <div className="flex-1 flex flex-col gap-4">

        {/* Année */}
        <div>
          <Label>Année</Label>
          <select className={sel} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="all">Toutes les années</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Département 1 */}
        <div>
          <Label><span className="text-red-500 mr-1">●</span>Département 1</Label>
          <select className={sel} value={dep1Code || ""} onChange={(e) => setDep1Code(e.target.value || null)}>
            <option value=""> Choisir </option>
            {depList.map((d) => <option key={d.code} value={d.code}>{d.code} – {d.nom}</option>)}
          </select>
          {dep1Code && (
            <button className={`${btnInactive} mt-1.5`} onClick={() => setDep1Code(null)}>
              Désélectionner
            </button>
          )}
        </div>

        {/* Département 2 */}
        <div>
          <Label><span className="text-blue-500 mr-1">●</span>Département 2</Label>
          <select className={sel} value={dep2Code || ""} onChange={(e) => setDep2Code(e.target.value || null)}>
            <option value=""> Choisir </option>
            {depList.map((d) => <option key={d.code} value={d.code}>{d.code} – {d.nom}</option>)}
          </select>
          {dep2Code && (
            <button className={`${btnInactive} mt-1.5`} onClick={() => setDep2Code(null)}>
              Désélectionner
            </button>
          )}
        </div>

        {/* Légende carte */}
        <div>
          <Label>Légende carte</Label>
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-3 h-3 rounded bg-red-500 flex-shrink-0" /> Département 1
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-3 h-3 rounded bg-blue-500 flex-shrink-0" /> Département 2
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-3 h-3 rounded bg-blue-100 border border-slate-200 flex-shrink-0" /> Non sélectionné
            </div>
          </div>
        </div>

        {/* Sélection en cours */}
        {(dep1Code || dep2Code) && (
          <div>
            <Label>Sélection en cours</Label>
            <div className="flex flex-col gap-1">
              {dep1Code && (
                <div className="text-xs bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 text-red-700 font-semibold truncate">
                  {depList.find((d) => d.code === dep1Code)?.nom ?? dep1Code}
                </div>
              )}
              {dep2Code && (
                <div className="text-xs bg-blue-50 border border-blue-200 rounded-lg px-2 py-1.5 text-blue-700 font-semibold truncate">
                  {depList.find((d) => d.code === dep2Code)?.nom ?? dep2Code}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};

export default SidebarComparateurMap;
