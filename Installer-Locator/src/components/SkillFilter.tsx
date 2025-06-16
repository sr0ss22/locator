import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { InstallerCertification, InstallerSkill } from "@/types/installer";

interface SkillFilterProps {
  selectedSkills: InstallerSkill[];
  selectedCertifications: InstallerCertification[];
  onSkillChange: (skill: InstallerSkill, checked: boolean) => void;
  onCertificationChange: (certification: InstallerCertification, checked: boolean) => void;
}

const allSkills: InstallerSkill[] = ["Blinds & Shades", "Shutters", "Drapery", "PowerView"];
const allCertifications: InstallerCertification[] = ["PowerView Pro", "Certified Installer", "Master Installer", "Master Shutter"];

const SkillFilter: React.FC<SkillFilterProps> = ({
  selectedSkills,
  selectedCertifications,
  onSkillChange,
  onCertificationChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg mb-2">Skills</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allSkills.map((skill) => (
            <div key={skill} className="flex items-center space-x-2">
              <Checkbox
                id={`skill-${skill}`}
                checked={selectedSkills.includes(skill)}
                onCheckedChange={(checked) => onSkillChange(skill, checked as boolean)}
              />
              <Label htmlFor={`skill-${skill}`}>{skill}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-2">Certifications</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allCertifications.map((cert) => (
            <div key={cert} className="flex items-center space-x-2">
              <Checkbox
                id={`cert-${cert}`}
                checked={selectedCertifications.includes(cert)}
                onCheckedChange={(checked) => onCertificationChange(cert, checked as boolean)}
              />
              <Label htmlFor={`cert-${cert}`}>{cert}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillFilter;