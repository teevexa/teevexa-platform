import {
  Building2, Heart, GraduationCap, ShoppingCart, Landmark, Plane,
  Wheat, Truck, Factory, Zap, Wifi, Shield, Scale, Clapperboard,
  Stethoscope, Home, Banknote, Globe, Leaf, Users, Cpu, Briefcase,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  building2: Building2,
  heart: Heart,
  "graduation-cap": GraduationCap,
  "shopping-cart": ShoppingCart,
  landmark: Landmark,
  plane: Plane,
  wheat: Wheat,
  truck: Truck,
  factory: Factory,
  zap: Zap,
  wifi: Wifi,
  shield: Shield,
  scale: Scale,
  clapperboard: Clapperboard,
  stethoscope: Stethoscope,
  home: Home,
  banknote: Banknote,
  globe: Globe,
  leaf: Leaf,
  users: Users,
  cpu: Cpu,
  briefcase: Briefcase,
};

export const industryIconOptions = Object.keys(iconMap).map((key) => ({
  value: key,
  label: key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
}));

interface IndustryIconProps {
  name: string | null;
  size?: number;
  className?: string;
}

const IndustryIcon = ({ name, size = 24, className }: IndustryIconProps) => {
  const Icon = name ? iconMap[name] : null;
  if (!Icon) return <Building2 size={size} className={className} />;
  return <Icon size={size} className={className} />;
};

export default IndustryIcon;
