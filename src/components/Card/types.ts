import { SvgName } from '@/components/Icons';

export interface SimpleCardProps {
  label: string;
  subLabel?: string;
  icon: SvgName;
  content?: string;
  tooltipContent?: string;
}
