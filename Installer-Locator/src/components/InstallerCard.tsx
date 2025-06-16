import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MapPin } from "lucide-react";
import { Installer } from "@/types/installer";
import { Badge } from "@/components/ui/badge";

interface InstallerCardProps {
  installer: Installer;
  distance?: number;
  pinNumber?: number; // New prop for the pin number
}

const InstallerCard: React.FC<InstallerCardProps> = ({ installer, distance, pinNumber }) => {
  const formattedDistance = distance !== undefined && distance !== null && distance !== Infinity
    ? `${distance.toFixed(1)} miles`
    : undefined;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center flex-wrap gap-2">
          {pinNumber && (
            <Badge className="bg-orange-500 text-white text-lg px-3 py-1 rounded-full mr-2">
              {pinNumber}
            </Badge>
          )}
          {installer.name}
          {installer.certifications.map((cert) => (
            <Badge key={cert} variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              {cert}
            </Badge>
          ))}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
          <span>{installer.address}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Phone className="h-4 w-4 mr-2 text-gray-500" />
          <span>{installer.phone}</span>
        </div>
        {formattedDistance && (
          <div className="font-medium text-blue-600">
            Distance: {formattedDistance}
          </div>
        )}
        {installer.installerVendorId && (
          <div className="text-gray-700">
            <span className="font-medium">Installer Vendor Id:</span> {installer.installerVendorId}
          </div>
        )}

        {/* Skills Section */}
        {installer.rawSupabaseData && (
          <div>
            <h4 className="font-semibold text-base mb-2">Skills:</h4>
            <div className="flex flex-wrap gap-2">
              {installer.rawSupabaseData.Blinds_and_Shades === 1 && (
                <Badge variant="default">Blinds & Shades</Badge>
              )}
              {installer.rawSupabaseData.Shutters === 1 && (
                <Badge variant="default">Shutters</Badge>
              )}
              {installer.rawSupabaseData.Draperies === 1 && (
                <Badge variant="default">Drapery</Badge>
              )}
              {installer.rawSupabaseData.PowerView === '1' && (
                <Badge variant="default">PowerView</Badge>
              )}
            </div>
          </div>
        )}

        {installer.acceptsShipments !== undefined && (
          <div className="text-gray-700">
            <span className="font-medium">Accepts Shipments :</span> {installer.acceptsShipments ? "Yes" : "No"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InstallerCard;