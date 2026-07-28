import type { IconType } from 'react-icons';
import {
  FiMonitor,
  FiTrendingUp,
  FiTarget,
  FiSearch,
  FiLayers,
  FiPenTool,
  FiSmartphone,
  FiShoppingCart,
  FiMail,
  FiBarChart2,
  FiCode,
  FiZap,
  FiGlobe,
  FiCamera,
  FiUsers,
  FiAward,
} from 'react-icons/fi';

/** Icons selectable for a service in the admin panel. */
export const SERVICE_ICONS: Record<string, IconType> = {
  FiMonitor,
  FiTrendingUp,
  FiTarget,
  FiSearch,
  FiLayers,
  FiPenTool,
  FiSmartphone,
  FiShoppingCart,
  FiMail,
  FiBarChart2,
  FiCode,
  FiZap,
  FiGlobe,
  FiCamera,
  FiUsers,
  FiAward,
};

export const SERVICE_ICON_NAMES = Object.keys(SERVICE_ICONS);

export function getServiceIcon(name?: string): IconType {
  return (name && SERVICE_ICONS[name]) || FiLayers;
}
