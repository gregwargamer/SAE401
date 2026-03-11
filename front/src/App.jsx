import { Sidebar } from './components/ui/sidebar'
import { DataDisplay } from './components/ui/datadisplay'
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  useEffect(() => {  //il a pas l'aire de vider, les logs de symfony metttent un truc quand je ctrl shift r mais pas quand je ferme et rouvre, peut etre quesiton de navigateur?
    const clearOnQuit = () => { localStorage.clear(); sessionStorage.clear(); };
    window.addEventListener('beforeunload', clearOnQuit);
    return () => window.removeEventListener('beforeunload', clearOnQuit);
  }, []);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDepartement, setSelectedDepartement] = useState(null);
  return (
    <>
      <Sidebar selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} selectedDepartement={selectedDepartement} setSelectedDepartement={setSelectedDepartement} />
      <DataDisplay selectedRegion={selectedRegion} selectedDepartement={selectedDepartement} />
    </>
  )
}

export default App
