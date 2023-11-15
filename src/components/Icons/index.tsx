import { SxProps, Theme } from '@mui/material/styles';
import React from 'react';

import IconButton from '@mui/material/IconButton';
import { CloseWrapper } from './styles';
import CloseSvg from '@/assets/icons/close.svg';
import CloseWhiteSvg from '@/assets/icons/close-white.svg';
import SearchSvg from '@/assets/icons/search.svg';
import ArrowDownSvg from '@/assets/icons/arrow-down.svg';
import ArrowLeftSvg from '@/assets/icons/arrow-left.svg';
import CalendarSvg from '@/assets/icons/calendar.svg';
import CustomerSvg from '@/assets/icons/customer.svg';
import DashboardSvg from '@/assets/icons/dashboard.svg';
import DashboardWhiteSvg from '@/assets/icons/dashboard-white.svg';
import DollarSvg from '@/assets/icons/dollar.svg';
import DownloadSvg from '@/assets/icons/download.svg';
import UserGroupSvg from '@/assets/icons/user-group.svg';
import UserGroupWhiteSvg from '@/assets/icons/user-group-white.svg';
import UserGroupOrangeSvg from '@/assets/icons/user-group-orange.svg';
import InformationSvg from '@/assets/icons/information.svg';
import PercentageSvg from '@/assets/icons/percentage.svg';
import ReceiveSvg from '@/assets/icons/receive.svg';
import SharingSvg from '@/assets/icons/sharing.svg';
import UserSvg from '@/assets/icons/user.svg';
import WalletSvg from '@/assets/icons/wallet.svg';
import WalletWhiteSvg from '@/assets/icons/wallet-white.svg';
import UpDownSvg from '@/assets/icons/up-down.svg';
import PayoutsSvg from '@/assets/icons/payouts.svg';
import PayoutsWhiteSvg from '@/assets/icons/payouts-white.svg';
import BrowserMetricSvg from '@/assets/icons/browser-metric.svg';
import BrowserMetricWhiteSvg from '@/assets/icons/browser-metric-white.svg';
import EyeSvg from '@/assets/icons/eye.svg';
import TrashSvg from '@/assets/icons/trash.svg';
import UserGroupAccountSvg from '@/assets/icons/user-group-account.svg';
import UserPlusSvg from '@/assets/icons/user-plus.svg';

const SvgData = {
  close: {
    svg: CloseSvg,
    Wrapper: CloseWrapper,
  },
  'close-white': {
    svg: CloseWhiteSvg,
    Wrapper: CloseWrapper,
  },
  'arrow-down': {
    svg: ArrowDownSvg,
  },
  'arrow-left': {
    svg: ArrowLeftSvg,
  },
  calendar: {
    svg: CalendarSvg,
  },
  customer: {
    svg: CustomerSvg,
  },
  dashboard: {
    svg: DashboardSvg,
  },
  'dashboard-white': {
    svg: DashboardWhiteSvg,
  },
  dollar: {
    svg: DollarSvg,
  },
  download: {
    svg: DownloadSvg,
  },
  'user-group': {
    svg: UserGroupSvg,
  },
  'user-group-white': {
    svg: UserGroupWhiteSvg,
  },
  'user-group-orange': {
    svg: UserGroupOrangeSvg,
  },
  information: {
    svg: InformationSvg,
  },
  percentage: {
    svg: PercentageSvg,
  },
  receive: {
    svg: ReceiveSvg,
  },
  sharing: {
    svg: SharingSvg,
  },
  user: {
    svg: UserSvg,
  },
  wallet: {
    svg: WalletSvg,
  },
  'wallet-white': {
    svg: WalletWhiteSvg,
  },
  'up-down': {
    svg: UpDownSvg,
  },
  search: {
    svg: SearchSvg,
  },
  payouts: {
    svg: PayoutsSvg,
  },
  'payouts-white': {
    svg: PayoutsWhiteSvg,
  },
  'browser-metric': {
    svg: BrowserMetricSvg,
  },
  'browser-metric-white': {
    svg: BrowserMetricWhiteSvg,
  },
  eye: {
    svg: EyeSvg,
  },
  trash: {
    svg: TrashSvg,
  },
  'user-group-account': {
    svg: UserGroupAccountSvg,
  },
  'user-plus': {
    svg: UserPlusSvg,
  },
};

export type SvgName = keyof typeof SvgData;

type IconProps = {
  name: SvgName;
  type?: string;
  sx?: SxProps<Theme>;
  onClick?: () => void;
};

function Icon({ name, type, onClick, sx = {} }: IconProps) {
  const svgData = SvgData[name] as any;

  if (!svgData) {
    return null;
  }

  const { svg: SVG, Wrapper = null } = svgData;

  if (type === 'button') {
    if (Wrapper) {
      return (
        <Wrapper sx={sx} color="inherit" aria-label={name} onClick={onClick}>
          <SVG />
        </Wrapper>
      );
    }
    return (
      <IconButton sx={sx} color="inherit" aria-label={name} onClick={onClick}>
        <SVG />
      </IconButton>
    );
  }

  return <SVG />;
}

export default Icon;
