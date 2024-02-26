import { HeaderCellProps } from '@/components/Table/utils';

// ---------------------------

export const BlacklistDomainsHeadTable: readonly HeaderCellProps[] = [
  {
    id: 'order',
    order: 1,
    label: window.T('No.'),
    numeric: true,
  },
  {
    id: 'data',
    order: 2,
    label: window.T('Data'),
  },
  {
    id: 'action',
    order: 3,
    numeric: true,
    label: window.T('Action'),
  },
];

// ---------------------------

export const PlatformTypeOptions = [
  // {
  //   value: '0',
  //   label: window.T('Unknown'),
  // },
  // {
  //   value: '1',
  //   label: window.T('Windows'),
  // },
  // {
  //   value: '2',
  //   label: window.T('Linux'),
  // },
  // {
  //   value: '3',
  //   label: window.T('Android'),
  // },
  // {
  //   value: '4',
  //   label: window.T('OSX'),
  // },
  // {
  //   value: '5',
  //   label: window.T('iOS'),
  // },
  // {
  //   value: '6',
  //   label: window.T('Any Platform'),
  // },
  {
    value: '7',
    label: window.T('All Platforms'),
  },
  // {
  //   value: '8',
  //   label: window.T('Chrome'),
  // },
];

// ---------------------------

export const ThreatEntryTypeOptions = [
  // {
  //   value: '0',
  //   label: window.T('Unspecified'),
  // },
  {
    value: '1',
    label: window.T('A URL'),
  },
  // {
  //   value: '2',
  //   label: window.T('An executable program'),
  // },
  // {
  //   value: '3',
  //   label: window.T('An IP range'),
  // },
  // {
  //   value: '4',
  //   label: window.T('Chrome extension'),
  // },
  // {
  //   value: '5',
  //   label: window.T('Filename'),
  // },
  // {
  //   value: '6',
  //   label: window.T('CERT'),
  // },
  // {
  //   value: '129',
  //   label: window.T('Wallet address'),
  // },
];

// ---------------------------

export const ThreatTypeOptions = [
  // {
  //   value: '0',
  //   label: window.T('Unknown'),
  // },
  // {
  //   value: '1',
  //   label: window.T('Malware'),
  // },
  // {
  //   value: '2',
  //   label: window.T('/// Social engineering threat type'),
  // },
  // {
  //   value: '3',
  //   label: window.T('Unwanted software'),
  // },
  // {
  //   value: '4',
  //   label: window.T('Potentially harmful application'),
  // },
  // {
  //   value: '5',
  //   label: window.T('/// Social engineering threat type for internal use'),
  // },
  // {
  //   value: '6',
  //   label: window.T('API abuse'),
  // },
  // {
  //   value: '7',
  //   label: window.T('Malicious binary'),
  // },
  // {
  //   value: '8',
  //   label: window.T('Client side detection whitelist'),
  // },
  // {
  //   value: '9',
  //   label: window.T('Client side download detection whitelist'),
  // },
  // {
  //   value: '10',
  //   label: window.T('Client incident'),
  // },
  // {
  //   value: '13',
  //   label: window.T('/// type13'),
  // },
  // {
  //   value: '14',
  //   label: window.T('Entities that are suspected to present a threat'),
  // },
  // {
  //   value: '15',
  //   label: window.T('/// Billing threat list. The internal proto enum name is different'),
  // },
  // {
  //   value: '16',
  //   label: window.T('/// Safe list to ship hashes of known safe URL expressions.'),
  // },
  {
    value: '129',
    label: window.T('Scam Web3'),
  },
];
