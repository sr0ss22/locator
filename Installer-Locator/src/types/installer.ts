export type InstallerSkill = "Blinds & Shades" | "Shutters" | "Drapery" | "PowerView";
export type InstallerCertification = "PowerView Pro" | "Certified Installer" | "Master Installer" | "Master Shutter" | "Drapery Pro" | "PIP Certified";

export interface Installer {
  id: string;
  name: string;
  address: string;
  zipCode: string;
  phone: string;
  skills: InstallerSkill[];
  certifications: InstallerCertification[];
  latitude?: number; // For mapping API integration
  longitude?: number; // For mapping API integration
  installerVendorId?: string; // New field for card display
  acceptsShipments?: boolean; // New field for card display
  // Raw data for detailed display on card
  rawSupabaseData?: any;
}