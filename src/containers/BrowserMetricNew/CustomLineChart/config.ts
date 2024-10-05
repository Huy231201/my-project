/* eslint-disable quotes */
interface MetricConfig {
  [key: string]: {
    title: string;
    description: string;
    values: {
      [key: string]: string;
    };
  };
}

export const LabelBrowserMetric = {
  //  [1]
  'Brave.Core.UsageDaily': {
    title: 'Daily Active Users',
    description: 'Số users sử dụng Herond Browser hàng ngày',
    values: { '0': 'No', '1': 'Yes' },
  },
  'Herond.Accounts.CreatedUsers': {
    title: 'Daily Register Users',
    description: 'Số users đăng ký mới Herond Account hàng ngày',
    values: { '0': 'No', '1': 'Yes' },
  },
  'Herond.Browser.Download': {
    title: 'Desktop Browser Download',
    description: 'Số lượt tải Herond Browser trên Desktop',
    values: { '0': 'No', '1': 'Yes' },
  },
  //  [0,1]
  'Brave.Wallet.EthTransactionSent': {
    title: 'Weekly Active Wallets',
    description: 'Số lượng Ví Herond sử dụng hàng tuần',
    values: { '0': 'No', '1': 'Yes' },
  },
  //  [1,2,3,4,5]
  'Brave.Core.ProfileCount': {
    title: 'Total Profile Count',
    description: 'Tổng lượng hồ sơ (profile) mà user đã tạo',
    values: { '0': '1', '1': '2', '2': '3', '3': '4-5', '4': '6+' },
  },
  //  [1]
  'Brave.Core.UsageMonthly': {
    title: 'Monthly Active Users',
    description: 'Số lượng user sử dụng Herond Browser hàng tháng',
    values: { '0': 'No', '1': 'Yes' },
  },
  //  [1]
  'Brave.VerticalTabs.OpenTabs': {
    title: 'Brave.VerticalTabs.OpenTabs',
    description: 'Số lượng tab mở tối đa trong tuần khi sử dụng tính năng vertical tab.',
    values: { '0': '1', '1': '2-5', '2': '6-10', '3': '11-50', '4': '51+' },
  },
  //  [0,3]
  'Brave.Core.BookmarksCountOnProfileLoad.2': {
    title: 'Profile Bookmark Count',
    description: 'Số lượt đánh dấu trang (bookmark) trên profile user',
    values: {
      '0': '0-5',
      '1': '6-20',
      '2': '21-100',
      '3': '101-500',
      '4': '501-1000',
      '5': '1001-5000',
      '6': '5001-10000',
      '7': '> 10000',
    },
  },
  // [0,1]
  'Brave.Core.CrashReportsEnabled': {
    title: 'Crash Report No',
    description: ' Số lượt báo cáo sập trang khi user dùng Herond Browser',
    values: {
      '0': 'No',
      '1': 'Yes',
    },
  },
  // [0,1,2,3,4,5,6]
  'Brave.Core.DomainsLoaded': {
    title: 'Weekly Domain Loaded',
    description: 'Số lượng Domain mà user đã truy cập hàng tuần',
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
  // [0,1]
  'Brave.Core.IsDefault': {
    title: 'Default Browser Setting Count',
    description: 'Tổng số lượt user cài đặt Herond làm trình duyệt mặc định',
    values: {
      '0': 'No',
      '1': 'Yes',
    },
  },
  // [0,1,2,3,4]
  'Brave.Core.LastTimeIncognitoUsed': {
    title: 'Incognito Window Count',
    description: 'Tổng số lượt user mở cửa sổ ẩn danh',
    values: {
      '0': 'Used in last 24h',
      '1': 'Used in last week but not 24h',
      '2': 'Used in last 28 days but not week',
      '3': 'Ever used but not in last 28 days',
      '4': 'Never used',
    },
  },
  // [0,1,2,3]
  'Brave.Core.NumberOfExtensions': {
    title: 'No. of Extensions',
    description: 'Số lượng phần mở rộng (extension) được cài đặt trên Herond Browser',
    values: {
      '0': '0',
      '1': '1',
      '2': '2-4',
      '3': '> 4',
    },
  },
  // [0,1,2,3,4,5,6]
  'Brave.Core.PagesLoaded': {
    title: 'Weekly Pages Loaded',
    description: 'Số trang user tải hàng tuần',
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
  // [0,1,2,3,4]
  'Brave.Core.TabCount': {
    title: 'Open Tab Count',
    description: 'Số lượng Tabs trên Herond Browser được mở',
    values: {
      '0': '0-1',
      '1': '2-5',
      '2': '6-10',
      '3': '11-50',
      '4': '> 50',
    },
  },
  // [1]
  'Brave.Core.TorEverUsed': {
    title: 'Tor Window Opens',
    description: 'Tổng số lần user mở cửa sổ ẩn danh Tor',
    values: {
      '0': 'Yes',
      '1': 'No',
    },
  },
  //  [0,1,2,3,4,5,,6,7]
  'Brave.Core.WeeklyUsage': {
    title: 'Weekly Active Users',
    description: 'Số lượng user sử dụng Herond Browser hàng tuần',
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
  //  [0,1,2,3]
  'Brave.Core.WindowCount.2': {
    title: 'Total Window Count',
    description: 'Tổng số lượt mở cửa sổ trình duyệt (window) của user',
    values: {
      '0': '0',
      '1': '1',
      '2': '2-5',
      '3': '> 5',
    },
  },
  //  [0,1,2,3,4,5,6,7]
  'Brave.Importer.ImporterSource.2': {
    title: 'Imports / Import Source',
    description: 'Số lượt user import setting/cookies và nguồn import',
    values: {
      '0': 'Did not import',
      '1': 'Imported from Bookmarks HTML File',
      '2': 'Imported from Chrome',
      '3': 'Imported from Firefox',
      '4': 'Imported from Microsoft (Includes IE, Legacy Edge, Chromium Edge)',
      '5': 'Imported from Opera',
      '6': 'Imported from Safari',
      '7': 'Other',
    },
  },
  //  [0]
  'Brave.IPFS.DaemonRunTime': {
    title: 'Daemon Background Process Runtime',
    description: 'Thời gian trình nền Daemon được khởi chạy',
    values: {
      '0': '0-5min',
      '1': '5-60min',
      '2': '1h-24h',
      '3': '> 24h',
    },
  },
  //  [0]
  'Brave.IPFS.DetectionPromptCount': {
    title: 'IPFS Detection Prompt Count',
    description: 'Số lần phát hiện IPFS hiển thị mà không cài đặt',
    values: {
      '0': '0 times',
      '1': '1 time',
      '2': '2-5 times',
      '3': '6 times or more',
    },
  },
  //  [0,1]
  'Brave.IPFS.GatewaySetting': {
    title: 'IPFS Gateway Setting',
    description: 'IPFS giải quyết các giao thức IPFS/IPNS như thế nào?',
    values: {
      '0': 'Ask',
      '1': 'Gateway',
      '2': 'Local Node',
      '3': 'Disabled',
    },
  },
  //  [0]
  'Brave.IPFS.IPFSCompanionInstalled': {
    title: 'IPFS Companion Installed',
    description: 'Số lượng gói tập tin IPFS được thiết lập',
    values: {
      '0': 'No',
      '1': 'Yes',
    },
  },
  //  [0]
  'Brave.IPFS.LocalNodeRetention': {
    title: 'IPFS Local Node Retention',
    description: 'Số lượng IPFS node được cài đặt và thời gian hoạt động',
    values: {
      '0': 'Never installed',
      '1': 'Installed, in use',
      '2': 'Installed, but disabled',
    },
  },
  //   [0]
  'Brave.NTP.CustomizeUsageStatus': {
    title: 'Clicked on Setting',
    description: 'Số lượng user click vào Setting trên trình duyệt tại trang New Tab',
    values: {
      '0': 'No',
      '1': "Yes, but I didn't make any changes",
      '2': 'Yes, and I did make a change',
    },
  },
  //  [0]
  'Brave.NTP.SponsoredImagesEnabled': {
    title: 'Sponsored Images Enabled',
    description: 'Trang New Tab có cho phép hiện hình ảnh sponsor chưa?',
    values: {
      '0': 'Disabled',
      '1': 'Enabled',
    },
  },
  //  [0,1,2,3,4,5,6]
  'Brave.Omnibox.SearchCount': {
    title: 'User Search Count',
    description: 'Số lượt search của user trên Herond Browser',
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
  //  [0,1,2,3]
  'Brave.P3A.SentAnswersCount': {
    title: 'Sent Answer Count',
    description: 'Số câu trả lời cho các câu hỏi của user được gửi từ Browser hàng tuần',
    values: {
      '0': 'None',
      '1': 'Between 1 and 4',
      '2': 'Between 5 and 9',
      '3': '10 or more',
    },
  },
  //  [0,1,2,3,4,5,6,7]
  'Brave.Savings.BandwidthSavingsMB': {
    title: 'Weekly Bandwith Savings',
    description: 'Dung lượng dữ liệu mà Herond tiết kiệm cho user hàng tuần',
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
  //  [0,1,2]
  'Brave.Shields.AdBlockSetting': {
    title: 'Shields AdBlock Setting',
    description: 'Adblock setting trung bình là gì?',
    values: {
      '0': 'Disabled',
      '1': 'Standard',
      '2': 'Aggressive',
    },
  },
  //  [0,1]
  'Brave.Shields.CookieListEnabled': {
    title: 'Shields Cookie List Enabled',
    description: 'Có thông báo lấy ý kiến user trước khi block cookies không?',
    values: {
      '0': 'No',
      '1': 'Yes',
    },
  },
  //  [0,1]
  'Brave.Shields.DomainAdsSettingsAboveGlobal': {
    title: 'Shields Domain Block Settings Above Average',
    description: 'Số lượng domain mà user tăng mức độ phòng chống của Shield cao hơn mức bình thường',
    values: {
      '0': '0',
      '1': '1-5',
      '2': '6-10',
      '3': '11-20',
      '4': '21-30',
      '5': '31+',
    },
  },
  //  [0,1,2,3,5]
  'Brave.Shields.DomainAdsSettingsBelowGlobal': {
    title: 'Shields Domain Ads Settings Below Average',
    description: 'Số lượng domain được user set cấu hình adblock khác thông số mặc định',
    values: {
      '0': '0',
      '1': '1-5',
      '2': '6-10',
      '3': '11-20',
      '4': '21-30',
      '5': '31+',
    },
  },
  // [0,1]
  'Brave.Shields.DomainFingerprintSettingsAboveGlobal': {
    title: 'Shields Domain Fingerprint Settings Above Average',
    description: ' Số lượng domain được user set cấu hình Fingerprint trên thông số mặc định',
    values: {
      '0': '0',
      '1': '1-5',
      '2': '6-10',
      '3': '11-20',
      '4': '21-30',
      '5': '31+',
    },
  },
  //   [0,1,5]
  'Brave.Shields.DomainFingerprintSettingsBelowGlobal': {
    title: 'Shields Domain Fingerprint Settings Below Average',
    description: 'Số lượng domain được user set cấu hình Fingerprint dưới thông số mặc định',
    values: {
      '0': '0',
      '1': '1-5',
      '2': '6-10',
      '3': '11-20',
      '4': '21-30',
      '5': '31+',
    },
  },
  //  [0,1,2]
  'Brave.Shields.FingerprintBlockSetting': {
    title: 'Shields Fingerprint Block Setting',
    description: 'Số lượt cài đặt chặn fingerprinting trong Herond Shield',
    values: {
      '0': 'Disabled',
      '1': 'Standard',
      '2': 'Aggressive',
    },
  },
  //  [0,2,3]
  'Brave.Shields.UsageStatus': {
    title: 'Shields Usage Status',
    description: 'Số lượng user tuỳ chỉnh lại menu settings Shield của Herond Browser tại trang New Tab',
    values: {
      '0': 'Never clicked on shields icon',
      '1': 'Clicked on it, but never made a change',
      '2': 'Clicked on it, shut off shields for one or more sites',
      '3': 'Clicked on it, changed Shields defaults or per-site shield settings in addition to (or in place of) shutting off shields on one or more sites',
    },
  },
  //   [0,1,2]
  'Brave.Toolbar.FrequentMenuGroup': {
    title: 'Toolbar Frequent Menu Group',
    description: 'Thống kê nhóm tính năng được user truy cập',
    values: {
      '0': 'Tab & window actions (new tab/new window)',
      '1': 'Brave features (Wallet, Rewards, Sync)',
      '2': 'Browser views (History, Bookmarks, Extensions, Settings)',
    },
  },
  // [0,1,2,3,4]
  'Brave.Toolbar.MenuDismissRate': {
    title: 'Toolbar Menu Dismiss Rate',
    description: 'Mức độ thường xuyên của việc user mở menu ra rồi đóng lại nhưng không thực hiện hành động nào khác',
    values: {
      '0': 'Menu was not opened in the past week',
      '1': 'Less than 25% (exclusive) of opens',
      '2': 'Between 25% (inclusive) and 50% (exclusive) of opens',
      '3': 'Between 50% (inclusive) and 75% (exclusive) of opens',
      '4': 'More than 75% of opens',
    },
  },
  // [0,1,2,3,4,5]
  'Brave.Toolbar.MenuOpens': {
    title: 'Weekly Menu Opens',
    description: 'Số lần user mở Menu trong tuần qua',
    values: {
      '0': '0',
      '1': '1-5',
      '2': '6-15',
      '3': '16-29',
      '4': '30-49',
      '5': '50+',
    },
  },
  //  [0,1,2,3]
  'Brave.Uptime.BrowserOpenMinutes': {
    title: 'Browser Open Minutes',
    description: 'Thời lượng (số phút) browser được user mở lên trong tuần qua',
    values: {
      '0': 'N/A -- seven days have not passed since first open',
      '1': '0 - 30min',
      '2': '30min - 5hrs',
      '3': '5hrs+',
    },
  },
  //  [0,1]
  'Brave.Wallet.ActiveEthAccounts': {
    title: 'Active ETH accounts',
    description: 'Số lượng ví ETH có số dư dương đang hoạt động',
    values: {
      '0': '0 accounts',
      '1': '1 account',
      '2': '2 accounts',
      '3': '3 accounts',
      '4': '4-7 accounts',
      '5': '8+ accounts',
    },
  },
  //  [1]
  'Brave.Wallet.ActiveSolAccounts': {
    title: 'Active SOL accounts',
    description: 'Số lượng ví SOL có số dư dương đang hoạt động',
    values: {
      '0': '0 accounts',
      '1': '1 account',
      '2': '2 accounts',
      '3': '3 accounts',
      '4': '4-7 accounts',
      '5': '8+ accounts',
    },
  },
  //  [3,4]
  'Brave.Wallet.DefaultSolanaWalletSetting': {
    title: 'Default Solana Wallet Setting',
    description: 'Số lượng ví Solana thiết lập mặc định',
    values: {},
  },
  //  [3,4]
  'Brave.Wallet.DefaultWalletSetting': {
    title: 'Default Wallet Setting',
    description: 'Số lượng Ví Herond để setting mặc định',
    values: {},
  },
  //  [0,1,2]
  'Brave.Wallet.EthProvider.2': {
    title: 'ETH SOL Wallets',
    description: 'Số lượng ví SOL/ETH được khởi tạo',
    values: {
      '0': 'None, because no wallet is setup',
      '1': 'None, because the default provider setting is set to "Extensions (no fallback)"',
      '2': 'Brave Wallet (wallet is setup, no installed extension)',
      '3': 'Brave Wallet (wallet is setup, an extension may potentially be installed but cannot override native provider)',
      '4': 'Third-party extension (not overriding a setup Brave Wallet)',
      '5': 'Third-party extension (overriding a setup Brave Wallet)',
    },
  },
  //  [0,1]
  'Brave.Wallet.KeyringCreated': {
    title: 'Wallet Keyring Created',
    description: 'Tổng số Key Ví Herond được tạo',
    values: {
      '0': 'No',
      '1': 'Yes',
    },
  },
  //  [1,2,3,4,5,6]
  'Brave.Wallet.LastUsageTime': {
    title: 'Wallet Last Usage Time',
    description: 'Thời gian user sử dụng ví lần cuối',
    values: {
      '0': 'Within the last 6 days',
      '1': '7 - 13 days ago',
      '2': '14 - 20 days ago',
      '3': '21 - 27 days ago',
      '4': '28 - 59 days ago',
      '5': '60 days ago or more',
    },
  },
  //  [0,1,2,3,4]
  'Brave.Wallet.NewUserReturning': {
    title: 'Wallet New User Returning',
    description: 'Số lượng new user quay trở lại sử dụng ví trong tuần qua',
    values: {
      '0': 'I have never used Brave News',
      '1': "I have used Brave News, but I'm not a first time Brave News user this week",
      '2': "I'm a first time Brave News user this week but, no, I did not return the rest of the week",
      '3': "I'm a first time Brave News user this week and, yes, I returned and used it again the following day",
      '4': "I'm a first time Brave News user this week and, yes, I returned and used it again this week but not the following day",
    },
  },
  //  [0,1,2]
  'Brave.Wallet.OnboardingConversion.2': {
    title: 'Wallet Onboarding Conversion',
    description: 'Số lượng user chuyển đổi tạo ví từ quá trình onboarding',
    values: {
      '0': 'Viewed onboarding splash',
      '1': 'Between "Legal stuff" and "Create password"',
      '2': 'During "recovery phrase" steps',
      '3': 'Completed onboarding after completing "recovery phrase" steps',
      '4': 'Completed onboarding after skipping "recovery phrase" steps',
    },
  },
  //  [0,1,2,3,4,5]
  'Brave.Wallet.UsageDaysInWeek': {
    title: 'Weekly Wallet Usage',
    description: 'Số ngày ví được sử dụng trong tuần',
    values: {
      '0': '1 to 2 days',
      '1': '3 to 4 days',
      '2': '5 to 6 days',
      '3': '7 days',
    },
  },
  //  [0,1]
  'Brave.Wallet.UsageMonthly.2': {
    title: 'Monthly Wallet Usage',
    description: 'Số lượt sử dụng ví Herond hằng tháng',
    values: {
      '0': 'No',
      '1': 'Yes',
    },
  },
  //  [0,1,3,7]
  'Brave.Welcome.InteractionStatus': {
    title: 'Welcome Interaction Status',
    description: 'Thống kê lượt user trải nghiệm onboard screen',
    values: {
      '0': 'Only viewed the welcome screen, performed no action',
      '1': 'Viewed the profile import screen',
      '2': 'Viewed the diagnostic/analytics consent screen',
      '3': 'Finished the onboarding process',
    },
  },
} as MetricConfig;
