import React, { useState, useEffect, useMemo } from "react";
import InstallerSearch from "@/components/InstallerSearch";
import SkillFilter from "@/components/SkillFilter";
import InstallerList from "@/components/InstallerList";
import InstallerMap from "@/components/InstallerMap";
import { Installer, InstallerCertification, InstallerSkill } from "@/types/installer";
import { Separator } from "@/components/ui/separator";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { run as getCoordinates } from "@/functions/getCoordinates";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Locator: React.FC = () => {
  const [searchedZipCode, setSearchedZipCode] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<InstallerSkill[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<InstallerCertification[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number | null; lng: number | null } | null>(null);
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [loadingInstallers, setLoadingInstallers] = useState<boolean>(true);
  const [loadingUserLocation, setLoadingUserLocation] = useState<boolean>(false);
  const [installerDistancesMap, setInstallerDistancesMap] = useState<Map<string, number>>(new Map());
  const [loadingOrs, setLoadingOrs] = useState<boolean>(false);

  // IMPORTANT: In a real-world application, this value should be loaded from
  // environment variables (e.g., via a .env file) and NOT hardcoded for security.
  // This is done here because environment variables are not being picked up.
  const OPENROUTESERVICE_API_KEY = "5b3ce3597851110001cf6248d8c27a7c67644fb391eaf7080c84c301"; 

  useEffect(() => {
    const fetchInstallers = async () => {
      setLoadingInstallers(true);
      const { data, error } = await supabase
        .from('installers')
        .select('*');

      if (error) {
        console.error("Error fetching installers from Supabase:", error);
        toast.error("Failed to load installers. Please try again later.");
        setInstallers([]);
      } else {
        const mappedInstallers: Installer[] = (data || []).map((rawInstaller: any) => {
          const skills: InstallerSkill[] = [];
          if (rawInstaller.Blinds_and_Shades === 1) skills.push("Blinds & Shades");
          if (rawInstaller.PowerView === '1') skills.push("PowerView");
          if (rawInstaller.Shutters === 1) skills.push("Shutters");
          if (rawInstaller.Draperies === 1) skills.push("Drapery");

          const certifications: InstallerCertification[] = [];
          if (rawInstaller.Powerview_Certification) certifications.push(rawInstaller.Powerview_Certification);
          if (rawInstaller.Shutter_Certification_Level) certifications.push(rawInstaller.Shutter_Certification_Level);
          if (rawInstaller.Draperies_Certification_Level) certifications.push(rawInstaller.Draperies_Certification_Level);
          if (rawInstaller.PIP_Certification_Level) certifications.push(rawInstaller.PIP_Certification_Level);

          return {
            id: rawInstaller.id,
            name: rawInstaller.name || rawInstaller.H,
            address: `${rawInstaller.address1 || ''} ${rawInstaller.add2 || ''}, ${rawInstaller.city || ''}, ${rawInstaller.state || ''} ${rawInstaller.postalcode || ''}`.trim(),
            phone: rawInstaller.primary_phone,
            skills: skills,
            certifications: certifications,
            latitude: rawInstaller.latitude,
            longitude: rawInstaller.longitude,
            zipCode: rawInstaller.postalcode,
            installerVendorId: rawInstaller.Installer_Vendor_ID?.toString(),
            acceptsShipments: rawInstaller.Shipment === 'Yes',
            rawSupabaseData: rawInstaller,
          };
        });

        setInstallers(mappedInstallers);
      }
      setLoadingInstallers(false);
    };

    fetchInstallers();
  }, []);

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (searchedZipCode) {
        setLoadingUserLocation(true);
        setInstallerDistancesMap(new Map());
        const coords = await getCoordinates({ searchText: searchedZipCode });
        setUserLocation(coords);
        setLoadingUserLocation(false);
        if (coords.lat === null || coords.lng === null) {
          toast.error("Could not find coordinates for the entered zip code. Please ensure it's valid.");
        }
      } else {
        setUserLocation(null);
        setInstallerDistancesMap(new Map());
      }
    };
    fetchUserLocation();
  }, [searchedZipCode]);

  useEffect(() => {
    const fetchDrivingDistances = async () => {
      if (!userLocation || userLocation.lat === null || userLocation.lng === null || !installers.length) {
        setInstallerDistancesMap(new Map());
        return;
      }

      if (!OPENROUTESERVICE_API_KEY || OPENROUTESERVICE_API_KEY === "YOUR_OPENROUTESERVICE_API_KEY_HERE") {
        console.error("OpenRouteService API key is not set or is a placeholder.");
        toast.error("Mapping service is not configured. Please set your OpenRouteService API key.");
        setInstallerDistancesMap(new Map());
        return;
      }

      setLoadingOrs(true);
      setInstallerDistancesMap(new Map());

      const validInstallers = installers.filter(i => 
        i.latitude !== null && i.latitude !== undefined && 
        i.longitude !== null && i.longitude !== undefined &&
        i.id !== null && i.id !== undefined
      );

      if (validInstallers.length === 0) {
        toast.info("No installers with valid coordinates or IDs found for distance calculation.");
        setInstallerDistancesMap(new Map());
        setLoadingOrs(false);
        return;
      }

      const locations = [
        [userLocation.lng, userLocation.lat],
        ...validInstallers.map(i => [i.longitude!, i.latitude!])
      ];

      const destinationsIndices = Array.from({ length: validInstallers.length }, (_, i) => i + 1);

      try {
        const res = await fetch("https://api.openrouteservice.org/v2/matrix/driving-car", {
          method: "POST",
          headers: {
            "Authorization": OPENROUTESERVICE_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            locations: locations,
            sources: [0],
            destinations: destinationsIndices,
            metrics: ["distance"]
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("OpenRouteService API error:", errorData);
          throw new Error(`OpenRouteService API error: ${res.status} - ${errorData.error?.message || res.statusText}`);
        }

        const data = await res.json();
        const distances = data.distances ? data.distances[0] : [];
        
        const newMap = new Map<string, number>();
        validInstallers.forEach((installer, index) => {
          const distanceInMeters = distances[index];
          if (distanceInMeters !== undefined && distanceInMeters !== null && distanceInMeters !== Infinity) {
            newMap.set(installer.id, distanceInMeters / 1609.34);
          }
        });
        setInstallerDistancesMap(newMap);

      } catch (error) {
        console.error("Error fetching driving distances:", error);
        toast.error("Failed to calculate driving distances. Please try again.");
        setInstallerDistancesMap(new Map());
      } finally {
        setLoadingOrs(false);
      }
    };

    if (searchedZipCode && userLocation?.lat !== null && userLocation?.lng !== null && installers.length > 0) {
      fetchDrivingDistances();
    } else {
      setInstallerDistancesMap(new Map());
    }
  }, [userLocation, installers, searchedZipCode, OPENROUTESERVICE_API_KEY]);

  const filteredAndSortedInstallers = useMemo(() => {
    let currentInstallers = installers;

    if (selectedSkills.length > 0) {
      currentInstallers = currentInstallers.filter((installer) =>
        selectedSkills.every((skill) => (installer.skills ?? []).includes(skill))
      );
    }

    if (selectedCertifications.length > 0) {
      currentInstallers = currentInstallers.filter((installer) =>
        selectedCertifications.every((cert) => (installer.certifications ?? []).includes(cert))
      );
    }

    let installersWithDistance = currentInstallers.map(installer => {
      const distance = installerDistancesMap.get(installer.id);
      return {
        ...installer,
        distance: distance !== undefined ? distance : Infinity
      };
    });

    installersWithDistance.sort((a, b) => a.distance - b.distance);

    const installersWithinRadius = installersWithDistance.filter(installer => installer.distance <= 100);

    const finalInstallers = installersWithinRadius.slice(0, 5);

    if (searchedZipCode && !loadingUserLocation && !loadingOrs && finalInstallers.length === 0) {
      toast.info("No installers found within 100 miles for the entered zip code and selected filters.");
    }

    return finalInstallers;
  }, [installers, searchedZipCode, selectedSkills, selectedCertifications, installerDistancesMap, loadingUserLocation, loadingOrs]);

  const handleSkillChange = (skill: InstallerSkill, checked: boolean) => {
    setSelectedSkills((prev) =>
      checked ? [...prev, skill] : prev.filter((s) => s !== skill)
    );
  };

  const handleCertificationChange = (certification: InstallerCertification, checked: boolean) => {
    setSelectedCertifications((prev) =>
      checked ? [...prev, certification] : prev.filter((c) => c !== certification)
    );
  };

  const isLoadingData = loadingInstallers || loadingUserLocation || loadingOrs;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        <div className="flex items-center justify-center mb-8">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Hunter_Douglas_Logo.svg" 
            alt="Hunter Douglas Logo" 
            className="h-12 mr-4" 
          />
          <h1 className="text-3xl font-bold text-center">
            Installer Locator
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Filters + Installer List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filter Sidebar content */}
            <div className="p-4 border rounded-lg shadow-sm bg-card space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Find Installers</h2>
              <InstallerSearch onSearch={setSearchedZipCode} />
              <Separator />
              <SkillFilter
                selectedSkills={selectedSkills}
                selectedCertifications={selectedCertifications}
                onSkillChange={handleSkillChange}
                onCertificationChange={handleCertificationChange}
              />
            </div>
            {/* Installer List (moved here) */}
            <div className="mt-8">
              {isLoadingData ? (
                <p className="text-center text-gray-500 mt-8">
                  {loadingInstallers ? "Loading installers..." : ""}
                  {loadingUserLocation && searchedZipCode ? `Getting location for ${searchedZipCode}...` : ""}
                  {loadingOrs && searchedZipCode && userLocation?.lat !== null ? "Calculating driving distances..." : ""}
                </p>
              ) : (
                <InstallerList
                  installers={filteredAndSortedInstallers}
                  searchedZipCode={searchedZipCode}
                />
              )}
              {searchedZipCode && (!userLocation || userLocation.lat === null) && !loadingUserLocation && (
                <p className="text-center text-sm text-red-500 mt-4">
                  Could not get coordinates for the entered zip code. Please try another.
                </p>
              )}
              <p className="text-center text-sm text-gray-500 mt-4">
                * Distances are calculated based on geographical coordinates and may not reflect actual driving routes. For precise driving distances, a dedicated mapping API (e.g., Google Maps Directions API) and a backend service are required.
              </p>
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="lg:col-span-2 h-[600px] w-full rounded-lg overflow-hidden shadow-sm">
            <InstallerMap
              userLocation={userLocation}
              installers={filteredAndSortedInstallers}
            />
          </div>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Locator;