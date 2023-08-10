/* eslint-disable quotes */
interface UserHeadCell {
  id: string;
  order: number;
  label: string;
  numeric?: boolean;
  width?: number;
}

export const rowsUserHeadCells = () =>
  new Array(10).fill(null).map((_, index) => ({
    order: index + 1,
    email: 'blockbase@gmail.com.hrd',
    wallet_address: '0xb5ba48...4F2ACc',
    clicks: '63,235',
    downloads: '63,235',
    downloads_growth_rate: '45%',
    valid_users: '33,342',
    earned_money: '33,342',
  }));

export const UserHeadCells: readonly UserHeadCell[] = [
  {
    id: 'order',
    order: 1,
    label: window.T('No.'),
    numeric: true,
    width: 120,
  },
  {
    id: 'email',
    order: 2,
    label: window.T('Email'),
    width: 360,
  },
  {
    id: 'wallet_address',
    order: 3,
    label: window.T('Wallet Address'),
  },
  {
    id: 'clicks',
    order: 4,
    numeric: true,
    label: window.T('Clicks'),
  },
  {
    id: 'downloads',
    order: 5,
    numeric: true,
    label: window.T('Downloads'),
  },
  {
    id: 'downloads_growth_rate',
    order: 6,
    label: window.T('Downloads growth rate'),
  },
  {
    id: 'valid_users',
    order: 7,
    numeric: true,
    label: window.T('Valid Users'),
  },
  {
    id: 'earned_money',
    order: 8,
    numeric: true,
    label: window.T('Earned Money (USDT)'),
  },
];

// ---------------------------

export const rowsRegionCell = () =>
  new Array(10).fill(null).map((_, index) => ({
    order: index + 1,
    region: 'North America',
    affiliate_users: '23,356',
    clicks: '63,235',
    downloads: '63,235',
    valid_users: '33,342',
    earned_money: '33,342',
  }));

export const RegionHeadCell: readonly UserHeadCell[] = [
  {
    id: 'order',
    order: 1,
    label: window.T('No.'),
    numeric: true,
    width: 120,
  },
  {
    id: 'region',
    order: 2,
    label: window.T('Region'),
    width: 360,
  },
  {
    id: 'affiliate_users',
    order: 3,
    label: window.T('Affiliate Users'),
  },
  {
    id: 'clicks',
    order: 4,
    numeric: true,
    label: window.T('Clicks'),
  },
  {
    id: 'downloads',
    order: 5,
    numeric: true,
    label: window.T('Downloads'),
  },
  {
    id: 'valid_users',
    order: 7,
    numeric: true,
    label: window.T('Valid Users'),
  },
  {
    id: 'earned_money',
    order: 8,
    numeric: true,
    label: window.T('Earned Money (USDT)'),
  },
];

// ----------------------------

export const rowsChanelCell = () =>
  new Array(10).fill(null).map((_, index) => ({
    order: index + 1,
    chanel: 'Facebook',
    affiliate_users: '23,356',
    clicks: '63,235',
    downloads: '63,235',
    valid_users: '33,342',
    earned_money: '33,342',
  }));

export const ChanelHeadCell: readonly UserHeadCell[] = [
  {
    id: 'order',
    order: 1,
    label: window.T('No.'),
    numeric: true,
    width: 120,
  },
  {
    id: 'chanel',
    order: 2,
    label: window.T('Chanel'),
    width: 360,
  },
  {
    id: 'affiliate_users',
    order: 3,
    label: window.T('Affiliate Users'),
  },
  {
    id: 'clicks',
    order: 4,
    numeric: true,
    label: window.T('Clicks'),
  },
  {
    id: 'downloads',
    order: 5,
    numeric: true,
    label: window.T('Downloads'),
  },
  {
    id: 'valid_users',
    order: 7,
    numeric: true,
    label: window.T('Valid Users'),
  },
  {
    id: 'earned_money',
    order: 8,
    numeric: true,
    label: window.T('Earned Money (USDT)'),
  },
];

export const MetricChartColors = [
  {
    borderColor: '#C01DC5',
    gradientStart: 'rgba(255, 254, 254, 0.00)',
    gradientEnd: 'rgba(192, 29, 197, 0.20)',
  },
  {
    borderColor: '#0066F4',
    gradientStart: 'rgba(255, 254, 254, 0.00)',
    gradientEnd: 'rgba(0, 102, 244, 0.20)',
  },
  {
    borderColor: '#7863DC',
    gradientStart: 'rgba(255, 254, 254, 0.00)',
    gradientEnd: 'rgba(120, 99, 220, 0.20)',
  },
  {
    borderColor: '#00C0F2',
    gradientStart: 'rgba(255, 254, 254, 0.00)',
    gradientEnd: 'rgba(0, 192, 242, 0.20)',
  },
  {
    borderColor: '#F42B2B',
    gradientStart: 'rgba(255, 254, 254, 0.00)',
    gradientEnd: 'rgba(244, 43, 43, 0.20)',
  },
  {
    borderColor: '#006400',
    gradientStart: 'rgba(255, 254, 254, 0.00)',
    gradientEnd: 'rgba(0, 100, 0, 0.20',
  },
  {
    borderColor: '#FF821C',
    gradientStart: 'rgba(255, 254, 254, 0.00)',
    gradientEnd: 'rgba(255, 122, 0, 0.20)',
  },
  {
    borderColor: '#70E000',
    gradientStart: 'rgba(255, 254, 254, 0.00)',
    gradientEnd: 'rgba(112, 224, 0, 0.20)',
  },
  {
    borderColor: '#F5CC00',
    gradientStart: 'rgba(255, 254, 254, 0.00)',
    gradientEnd: 'rgba(255, 212, 0, 0.20)',
  },
  {
    borderColor: '#A85311',
    gradientStart: 'rgba(255, 254, 254, 0.00)',
    gradientEnd: 'rgba(168, 83, 17, 0.20)',
  },
];

interface MetricConfig {
  [key: string]: {
    name: string;
    values: {
      [key: string]: string;
    };
  };
}

export const MetricConfigDumpData = {
  'Brave.Core.BookmarksCountOnProfileLoad.2': {
    name: 'User Bookmarks',
    values: {
      '1': '0-5',
      '2': '6-20',
      '3': '21-100',
      '4': '101-500',
      '5': '501-1000',
      '6': '1001-5000',
      '7': '5001-10000',
      '8': '> 10000',
    },
  },
  'Brave.Core.CrashReportsEnabled': {
    name: 'Is Crash Reports Enabled?',
    values: {
      '1': 'No',
      '2': 'Yes',
    },
  },
  'Brave.Core.DomainsLoaded': {
    name: 'Number of Unique Domains Visited',
    values: {
      '0': '0 domains',
      '1': '1-4',
      '2': '5-10',
      '3': '11-30',
      '4': '31-50',
      '5': '51-100',
      '6': '> 100 domains',
    },
  },
  'Brave.Core.IsDefault': {
    name: 'Is Herond Default Browser?',
    values: {
      '1': 'No',
      '2': 'Yes',
    },
  },
  'Brave.Core.LastTimeIncognitoUsed': {
    name: 'Last Time Use Incognito',
    values: {
      '1': 'Used in last 24h',
      '2': 'Used in last week but not 24h',
      '3': 'Used in last 28 days but not week',
      '4': 'Ever used but not in last 28 days',
      '5': 'Never used',
    },
  },
  'Brave.Core.NumberOfExtensions': {
    name: 'Number of Extensions',
    values: {
      '1': '0',
      '2': '1',
      '3': '2-4',
      '4': '> 4',
    },
  },
  'Brave.Core.PagesLoaded': {
    name: 'Page Loaded',
    values: {
      '0': '0',
      '1': '1-10',
      '2': '11-50',
      '3': '51-100',
      '4': '101-500',
      '5': '501-1000',
      '6': '> 1000 pages',
    },
  },
  'Brave.Core.TabCount': {
    name: 'Open Tabs',
    values: {
      '0': '0-1',
      '1': '2-5',
      '2': '6-10',
      '3': '11-50',
      '4': '> 50',
    },
  },
  'Brave.Core.TorEverUsed': {
    name: 'Tor Used',
    values: {
      '1': 'Yes',
      '2': 'No',
    },
  },
  'Brave.Core.WeeklyUsage': {
    name: 'Weekly Usage',
    values: {
      '0': '0 days',
      '1': '1 day',
      '2': '2 days',
      '3': '3 days',
      '4': '4 days',
      '5': '5 days',
      '6': '6 days',
      '7': '7 days',
    },
  },
  'Brave.Core.WindowCount.2': {
    name: 'Window Count',
    values: {
      '0': '0',
      '1': '1',
      '2': '2-5',
      '3': '> 5',
    },
  },
  'Brave.Importer.ImporterSource.2': {
    name: 'Profile Imported',
    values: {
      '1': 'Did not import',
      '2': 'Imported from Brave',
      '3': 'Imported from Chrome',
      '4': 'Imported from Firefox',
      '5': 'Imported from Bookmarks HTML',
      '6': 'Imported from Safari (answer only possible on macOS)',
    },
  },
  'Brave.IPFS.DaemonRunTime': {
    name: 'Daemon Runtime',
    values: {
      '0': '0-5min',
      '1': '5-60min',
      '2': '1h-24h',
      '3': '> 24h',
    },
  },
  'Brave.IPFS.DetectionPromptCount': {
    name: 'Detection Prompt Count',
    values: {
      '0': '0 times',
      '1': '1 time',
      '2': '2-5 times',
      '3': '6 times or more',
    },
  },
  'Brave.IPFS.GatewaySetting': {
    name: 'Gateway Setting',
    values: {
      '0': 'Ask',
      '1': 'Gateway',
      '2': 'Local Node',
      '3': 'Disabled',
    },
  },
  'Brave.IPFS.IPFSCompanionInstalled': {
    name: 'IPFS Companion Installed',
    values: {
      '1': 'No',
      '2': 'Yes',
    },
  },
  'Brave.IPFS.LocalNodeRetention': {
    name: 'Local Node Retention',
    values: {
      '0': 'Never installed',
      '1': 'Installed, in use',
      '2': 'Installed, but disabled',
    },
  },
  'Brave.NTP.CustomizeUsageStatus': {
    name: 'Customize Usage Status',
    values: {
      '0': 'No',
      '1': "Yes, but I didn't make any changes",
      '2': 'Yes, and I did make a change',
    },
  },
  'Brave.NTP.SponsoredImagesEnabled': {
    name: 'Sponsored Images Enabled',
    values: {
      '0': 'Disabled',
      '1': 'Enabled',
    },
  },
  'Brave.Omnibox.SearchCount': {
    name: 'Omnibox Search Count',
    values: {
      '0': 'Never',
      '1': '1 to 5 times',
      '2': '6 to 10 times',
      '3': '11 to 20 times',
      '4': '21 to 50 times',
      '5': '51 to 100 times',
      '6': '101 to 500 times',
      '7': 'More than 500 times',
    },
  },
  'Brave.P3A.SentAnswersCount': {
    name: 'Sent Answers Count',
    values: {
      '0': 'None',
      '1': 'Between 1 and 4',
      '2': 'Between 5 and 9',
      '3': '10 or more',
    },
  },
  'Brave.Savings.BandwidthSavingsMB': {
    name: 'Bandwidth Savings MB',
    values: {
      '0': '0',
      '1': '>0-50mb',
      '2': '51-100mb',
      '3': '101-200mb',
      '4': '201-400mb',
      '5': '401-700mb',
      '6': '701-1500mb',
      '7': 'more than 1501mb',
    },
  },
  'Brave.Shields.AdBlockSetting': {
    name: 'AdBlock Setting',
    values: {
      '0': 'Disabled',
      '1': 'Standard',
      '2': 'Aggressive',
    },
  },
  'Brave.Shields.CookieListEnabled': {
    name: '',
    values: {
      '1': 'No',
      '2': 'Yes',
    },
  },
  'Brave.Shields.DomainAdsSettingsAboveGlobal': {
    name: 'Domain Ads Settings Above Global',
    values: {
      '0': '0',
      '1': '1-5',
      '2': '6-10',
      '3': '11-20',
      '4': '21-30',
      '5': '31+',
    },
  },
  'Brave.Shields.DomainAdsSettingsBelowGlobal': {
    name: 'Domain Ads Settings Below Global',
    values: {
      '0': '0',
      '1': '1-5',
      '2': '6-10',
      '3': '11-20',
      '4': '21-30',
      '5': '31+',
    },
  },
  'Brave.Shields.DomainFingerprintSettingsAboveGlobal': {
    name: 'Domain Fingerprint Settings Above Global',
    values: {
      '0': '0',
      '1': '1-5',
      '2': '6-10',
      '3': '11-20',
      '4': '21-30',
      '5': '31+',
    },
  },
  'Brave.Shields.DomainFingerprintSettingsBelowGlobal': {
    name: 'Domain Fingerprint Settings Below Global',
    values: {
      '0': '0',
      '1': '1-5',
      '2': '6-10',
      '3': '11-20',
      '4': '21-30',
      '5': '31+',
    },
  },
  'Brave.Shields.FingerprintBlockSetting': {
    name: 'Fingerprint Block Setting',
    values: {
      '0': 'Disabled',
      '1': 'Standard',
      '2': 'Aggressive',
    },
  },
  'Brave.Shields.UsageStatus': {
    name: 'Herond Shield Usage Status',
    values: {
      '0': 'Never clicked on shields icon',
      '1': 'Clicked on it, but never made a change',
      '2': 'Clicked on it, shut off shields for one or more sites',
      '3': 'Clicked on it, changed Shields defaults or per-site shield settings in addition to (or in place of) shutting off shields on one or more sites',
    },
  },
  'Brave.Toolbar.FrequentMenuGroup': {
    name: 'Frequent Menu Group',
    values: {
      '0': 'Tab & window actions (new tab/new window)',
      '1': 'Brave features (Wallet, Rewards, Sync)',
      '2': 'Browser views (History, Bookmarks, Extensions, Settings)',
    },
  },
  'Brave.Toolbar.MenuDismissRate': {
    name: 'Menu Dismiss Rate',
    values: {
      '0': 'Menu was not opened in the past week',
      '1': 'Less than 25% (exclusive) of opens',
      '2': 'Between 25% (inclusive) and 50% (exclusive) of opens',
      '3': 'Between 50% (inclusive) and 75% (exclusive) of opens',
      '4': 'More than 75% of opens',
    },
  },
  'Brave.Toolbar.MenuOpens': {
    name: 'Menu Opens',
    values: {
      '0': '0',
      '1': '1-5',
      '2': '6-15',
      '3': '16-29',
      '4': '30-49',
      '5': '50+',
    },
  },
  'Brave.Uptime.BrowserOpenMinutes': {
    name: 'Browser Open Minutes',
    values: {
      '0': 'N/A -- seven days have not passed since first open',
      '1': '0 - 30min',
      '2': '30min - 5hrs',
      '3': '5hrs+',
    },
  },
  'Brave.Wallet.ActiveEthAccounts': {
    name: 'Active Eth Accounts',
    values: {
      '0': '0 accounts',
      '1': '1 account',
      '2': '2 accounts',
      '3': '3 accounts',
      '4': '4-7 accounts',
      '5': '8+ accounts',
    },
  },
  'Brave.Wallet.ActiveSolAccounts': {
    name: 'Active Sol Accounts',
    values: {
      '0': '0 accounts',
      '1': '1 account',
      '2': '2 accounts',
      '3': '3 accounts',
      '4': '4-7 accounts',
      '5': '8+ accounts',
    },
  },
  'Brave.Wallet.DefaultSolanaWalletSetting': {
    name: 'N/A',
    values: {},
  },
  'Brave.Wallet.DefaultWalletSetting': {
    name: 'N/A',
    values: {},
  },
  'Brave.Wallet.EthProvider.2': {
    name: 'Eth Provider',
    values: {
      '0': 'None, because no wallet is setup',
      '1': 'None, because the default provider setting is set to "Extensions (no fallback)"',
      '2': 'Brave Wallet (wallet is setup, no installed extension)',
      '3': 'Brave Wallet (wallet is setup, an extension may potentially be installed but cannot override native provider)',
      '4': 'Third-party extension (not overriding a setup Brave Wallet)',
      '5': 'Third-party extension (overriding a setup Brave Wallet)',
    },
  },
  'Brave.Wallet.KeyringCreated': {
    name: 'Keyring Created',
    values: {
      '0': 'No',
      '1': 'Yes',
    },
  },
  'Brave.Wallet.LastUsageTime': {
    name: 'Last Usage Time',
    values: {
      '0': 'Within the last 6 days',
      '1': '7 - 13 days ago',
      '2': '14 - 20 days ago',
      '3': '21 - 27 days ago',
      '4': '28 - 59 days ago',
      '5': '60 days ago or more',
    },
  },
  'Brave.Wallet.NewUserReturning': {
    name: 'New User Returning',
    values: {
      '0': 'I have never used Brave News',
      '1': "I have used Brave News, but I'm not a first time Brave News user this week",
      '2': "I'm a first time Brave News user this week but, no, I did not return the rest of the week",
      '3': "I'm a first time Brave News user this week and, yes, I returned and used it again the following day",
      '4': "I'm a first time Brave News user this week and, yes, I returned and used it again this week but not the following day",
    },
  },
  'Brave.Wallet.OnboardingConversion.2': {
    name: 'Onboarding Conversion',
    values: {
      '0': 'Viewed onboarding splash',
      '1': 'Between "Legal stuff" and "Create password"',
      '2': 'During "recovery phrase" steps',
      '3': 'Completed onboarding after completing "recovery phrase" steps',
      '4': 'Completed onboarding after skipping "recovery phrase" steps',
    },
  },
  'Brave.Wallet.UsageDaysInWeek': {
    name: 'Usage Days In Week',
    values: {
      '0': '1 to 2 days',
      '1': '3 to 4 days',
      '2': '5 to 6 days',
      '3': '7 days',
    },
  },
  'Brave.Wallet.UsageMonthly.2': {
    name: 'Usage Monthly',
    values: {
      '1': 'Yes',
    },
  },
  'Brave.Welcome.InteractionStatus': {
    name: 'Interaction Status',
    values: {
      '0': 'Only viewed the welcome screen, performed no action',
      '1': 'Viewed the profile import screen',
      '2': 'Viewed the diagnostic/analytics consent screen',
      '3': 'Finished the onboarding process',
    },
  },
} as MetricConfig;
