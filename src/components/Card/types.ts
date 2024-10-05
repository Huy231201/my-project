import { SvgName } from '@/components/Icons';

export interface SimpleCardProps {
  label: string;
  subLabel?: string;
  subLabel2?: string;
  icon: SvgName;
  content?: string;
  tooltipContent?: string;
  loading?: boolean;
}
