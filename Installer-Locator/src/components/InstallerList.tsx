import React from "react";
import InstallerCard from "./InstallerCard";
import { Installer } from "@/types/installer";

interface InstallerListProps {
  installers: (Installer & { distance?: number })[]; // Updated type to include optional numeric distance
  searchedZipCode: string;
}

const InstallerList: React.FC<InstallerListProps> = ({ installers, searchedZipCode }) => {
  if (installers.length === 0 && searchedZipCode) {
    return (
      <p className="text-center text-gray-500 mt-8">
        No installers found for the given criteria.
      </p>
    );
  } else if (installers.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-8">
        Enter a zip code and select filters to find installers.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 mt-8"> {/* Changed to grid-cols-1 */}
      {installers.map((installer, index) => (
        <InstallerCard
          key={installer.id}
          installer={installer}
          distance={installer.distance} // Pass the numeric distance directly
          pinNumber={index + 1} // Pass the pin number
        />
      ))}
    </div>
  );
};

export default InstallerList;