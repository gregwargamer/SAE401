import { useState } from "react";
import { Sidebar } from "../components/ui/sidebar";
import { DataDisplay } from "../components/ui/datadisplay";

const LegacyPage = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDepartement, setSelectedDepartement] = useState(null);

  return (
    <section className="page">
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1rem", alignItems: "start" }}>
        <Sidebar
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          setSelectedDepartement={setSelectedDepartement}
        />
        <div>
          <DataDisplay
            selectedRegion={selectedRegion}
            selectedDepartement={selectedDepartement}
          />
        </div>
      </div>
    </section>
  );
};

export default LegacyPage;
