const MONTHS = ["Ene 2026","Feb 2026","Mar 2026","Abr 2026","May 2026"];
const CURRENT_MONTH_IDX = 4;

const RAW = {
  "Customer A": {
    dashboards: [123, 3, 12, 46, 28],
    legacy_reports: [236, 124, 95, 94, 156],
    content_views: [8, 6, 5, 3, 1],
    goals: [51, 0, 4, 16, 4]
  },
  "Customer B": {
    dashboards: [0, 7, 1, 0, 0],
    legacy_reports: [2, 4, 5, 5, 11],
    content_views: [8, 0, 1, 1, 0]
  },
  "Customer C": {
    dashboards: [0, 0, 4, 9, 6],
    legacy_reports: [14, 0, 0, 30, 9],
    content_views: [0, 0, 0, 0, 2]
  },
  "Customer D": {
    dashboards: [2, 1, 0, 0, 0],
    legacy_reports: [134, 179, 134, 120, 187],
    content_report: [0, 0, 0, 1, 0],
    content_views: [0, 0, 1, 0, 0]
  },
  "Customer E": {
    insights: [93, 0, 0, 0, 0],
    dashboards: [39, 3, 40, 1, 12],
    legacy_reports: [102, 0, 58, 67, 32],
    content_report: [1, 0, 0, 0, 0],
    content_views: [146, 0, 15, 43, 0]
  },
  "Customer F": {
    insights: [14, 15, 0, 0, 9],
    dashboards: [7, 16, 44, 46, 37],
    legacy_reports: [0, 0, 0, 0, 1],
    content_report: [8, 10, 2, 0, 9],
    content_views: [12, 63, 10, 1, 134]
  },
  "Customer G": {
    dashboards: [58, 55, 27, 33, 36],
    content_views: [0, 0, 0, 2, 1]
  },
  "Customer H": {
    dashboards: [6, 5, 9, 5, 28],
    content_report: [0, 0, 7, 1, 0],
    content_views: [0, 0, 8, 0, 0]
  },
  "Customer I": {
    insights: [4, 0, 0, 0, 1],
    dashboards: [3, 0, 0, 0, 0],
    legacy_reports: [4, 5, 5, 4, 5],
    content_views: [1, 0, 2, 0, 0]
  },
  "Customer J": {
    dashboards: [1, 4, 2, 0, 0],
    content_views: [30, 24, 14, 15, 2],
    export_csv: [0, 0, 0, 1, 0]
  },
  "Customer K": {
    dashboards: [7, 13, 12, 8, 7],
    legacy_reports: [4, 16, 10, 4, 4],
    content_report: [1, 0, 0, 5, 7],
    content_views: [1, 1, 4, 15, 29]
  },
  "Customer L": {
    insights: [4, 6, 4, 1, 0],
    dashboards: [229, 83, 238, 211, 189],
    legacy_reports: [0, 0, 0, 3, 0],
    content_report: [7, 0, 5, 15, 0],
    content_views: [15, 4, 13, 55, 6],
    goals: [0, 0, 3, 0, 0]
  },
  "Customer M": {
    insights: [7, 22, 0, 0, 0],
    dashboards: [575, 243, 55, 57, 72],
    legacy_reports: [18, 73, 19, 40, 13],
    content_report: [1, 1, 0, 0, 0],
    content_views: [23, 62, 9, 0, 2],
    content_filters: [65, 0, 2, 4, 5],
    export_csv: [0, 0, 1, 0, 0]
  },
  "Customer N": {
    content_report: [0, 0, 0, 1, 0],
    content_views: [0, 0, 0, 18, 0]
  },
  "Customer O": {
    insights: [2, 0, 9, 0, 1],
    dashboards: [6, 26, 7, 3, 3],
    legacy_reports: [24, 26, 7, 14, 7],
    content_report: [0, 0, 5, 0, 0],
    content_views: [11, 55, 31, 8, 6],
    export_csv: [0, 0, 0, 0, 1]
  },
  "Customer P": {
    insights: [1, 3, 0, 2, 0],
    dashboards: [8, 84, 53, 128, 120],
    legacy_reports: [0, 0, 0, 1, 7],
    content_report: [0, 0, 0, 0, 3],
    content_views: [0, 59, 45, 2, 11]
  },
  "Customer Q": {
    dashboards: [15, 8, 8, 7, 2],
    legacy_reports: [19, 6, 0, 8, 11]
  },
  "Customer R": {
    dashboards: [72, 21, 91, 27, 6],
    legacy_reports: [590, 345, 461, 253, 139],
    content_views: [20, 10, 4, 5, 0]
  },
  "Customer S": {
    insights: [0, 0, 0, 1, 0],
    dashboards: [88, 24, 11, 62, 17],
    legacy_reports: [0, 0, 12, 0, 0],
    content_views: [94, 65, 71, 80, 66],
    export_csv: [2, 0, 0, 0, 0]
  },
  "Customer T": {
    insights: [41, 26, 21, 7, 8],
    dashboards: [47, 4, 6, 6, 4],
    legacy_reports: [410, 27, 51, 17, 10],
    content_report: [9, 2, 0, 2, 0],
    content_views: [18, 20, 21, 14, 4]
  },
  "Customer U": {
    insights: [1, 0, 0, 0, 0],
    content_report: [1, 0, 0, 0, 0],
    content_views: [9, 0, 0, 0, 0]
  },
  "Customer V": {
    insights: [0, 3, 4, 1, 52],
    dashboards: [900, 640, 603, 318, 398],
    legacy_reports: [132, 410, 193, 83, 155],
    content_report: [1, 2, 4, 4, 236],
    content_views: [34, 59, 56, 55, 97],
    content_filters: [34, 51, 22, 1, 20],
    export_csv: [0, 0, 1, 0, 0],
    goals: [6, 0, 0, 0, 0]
  },
  "Customer W": {},
  "Customer X": {
    insights: [2, 0, 0, 0, 0],
    dashboards: [2, 0, 0, 0, 0],
    legacy_reports: [3, 0, 0, 0, 0],
    content_report: [3, 0, 0, 0, 0],
    content_views: [4, 0, 0, 0, 0]
  },
  "Customer Y": {
    insights: [0, 17, 0, 0, 0],
    dashboards: [1182, 1, 0, 11, 779],
    legacy_reports: [268, 0, 0, 0, 179],
    content_report: [0, 5, 0, 0, 7],
    content_views: [1, 4, 0, 0, 34],
    content_filters: [0, 0, 0, 0, 7]
  },
  "Customer Z": {
    legacy_reports: [2, 0, 0, 0, 0],
    content_report: [1, 0, 0, 0, 0],
    content_views: [13, 0, 3, 0, 0]
  },
  "Customer AA": {
    insights: [0, 0, 0, 0, 1],
    dashboards: [182, 39, 9, 14, 135],
    legacy_reports: [0, 0, 6, 0, 0],
    content_report: [0, 0, 0, 0, 1],
    content_views: [21, 8, 3, 1, 30]
  },
  "Customer AB": {
    insights: [2, 5, 2, 3, 7],
    dashboards: [46, 2, 1, 0, 4],
    legacy_reports: [60, 6, 24, 7, 19],
    content_report: [0, 0, 6, 8, 2],
    content_views: [1, 11, 19, 6, 9],
    export_csv: [1, 1, 1, 1, 2],
    goals: [5, 0, 0, 0, 2]
  },
  "Customer AC": {
    insights: [102, 59, 2, 6, 3],
    dashboards: [565, 240, 96, 65, 56],
    legacy_reports: [827, 411, 425, 211, 224],
    content_views: [185, 189, 198, 252, 448],
    content_filters: [69, 69, 39, 50, 18],
    export_csv: [12, 26, 2, 30, 21]
  },
  "Customer AD": {
    dashboards: [0, 27, 0, 0, 0],
    legacy_reports: [0, 8, 28, 82, 0],
    content_views: [0, 23, 25, 28, 7],
    content_filters: [0, 2, 5, 1, 0]
  },
  "Customer AE": {
    insights: [0, 0, 0, 2, 0],
    dashboards: [9, 0, 0, 0, 0],
    legacy_reports: [7, 0, 0, 0, 0],
    content_report: [4, 0, 0, 3, 0],
    content_views: [135, 25, 32, 51, 5],
    export_csv: [69, 0, 3, 0, 0]
  },
  "Customer AF": {
    insights: [0, 1, 0, 0, 0],
    dashboards: [27, 15, 30, 56, 18],
    legacy_reports: [52, 153, 125, 36, 30],
    content_report: [0, 10, 4, 2, 0],
    content_views: [3, 34, 88, 0, 1],
    content_filters: [0, 6, 0, 0, 0],
    export_csv: [1, 1, 0, 0, 0],
    goals: [0, 0, 4, 0, 2]
  },
  "Customer AG": {
    insights: [0, 0, 21, 0, 1],
    dashboards: [0, 0, 11, 0, 0],
    legacy_reports: [0, 0, 18, 0, 0],
    content_report: [0, 0, 1, 0, 0],
    content_views: [0, 0, 24, 0, 3]
  },
  "Customer AH": {
    dashboards: [94, 46, 81, 30, 19],
    legacy_reports: [0, 0, 0, 5, 22],
    content_views: [7, 50, 57, 11, 21]
  },
  "Customer AI": {
    insights: [24, 1, 3, 14, 3],
    dashboards: [16, 25, 87, 90, 73],
    legacy_reports: [1031, 990, 1549, 407, 457],
    content_report: [20, 26, 20, 45, 15],
    content_views: [152, 92, 268, 275, 190],
    content_filters: [16, 21, 33, 15, 18],
    export_csv: [0, 19, 6, 12, 19]
  },
  "Customer AJ": {
    dashboards: [0, 0, 0, 1, 0],
    legacy_reports: [492, 456, 322, 264, 262],
    content_filters: [0, 2, 0, 0, 0]
  },
  "Customer AK": {
    dashboards: [0, 1, 0, 1, 0]
  },
  "Customer AL": {
    insights: [43, 9, 5, 13, 26],
    dashboards: [281, 50, 122, 188, 116],
    legacy_reports: [74, 0, 5, 6, 0],
    content_report: [6, 0, 3, 1, 5],
    content_views: [51, 13, 5, 39, 78],
    content_filters: [14, 0, 0, 0, 0],
    export_csv: [3, 0, 0, 0, 5],
    goals: [0, 0, 0, 16, 0]
  },
  "Customer AM": {
    insights: [0, 0, 3, 8, 7],
    dashboards: [12, 11, 22, 62, 7],
    legacy_reports: [14, 35, 21, 69, 25],
    content_report: [0, 0, 0, 6, 0],
    content_views: [19, 2, 8, 16, 19]
  },
  "Customer AN": {
    insights: [4, 1, 20, 8, 18],
    dashboards: [0, 36, 55, 12, 19],
    legacy_reports: [0, 0, 27, 0, 21],
    content_report: [2, 1, 24, 1, 15],
    content_views: [8, 16, 92, 29, 64],
    content_filters: [1, 0, 0, 0, 1]
  },
  "Customer AO": {
    dashboards: [1, 5, 2, 0, 0],
    legacy_reports: [209, 55, 100, 15, 0]
  },
  "Customer AP": {
    legacy_reports: [24, 0, 0, 0, 0]
  },
  "Customer AQ": {
    insights: [0, 0, 0, 17, 0],
    dashboards: [0, 0, 0, 120, 0],
    legacy_reports: [0, 0, 0, 17, 0],
    content_report: [0, 0, 0, 1, 0],
    content_views: [0, 0, 0, 58, 0],
    export_csv: [0, 0, 0, 3, 0]
  },
  "Customer AR": {
    insights: [0, 0, 0, 0, 1],
    dashboards: [0, 0, 0, 0, 9],
    legacy_reports: [0, 0, 0, 0, 2],
    content_report: [0, 0, 0, 0, 1],
    content_views: [0, 0, 0, 0, 1]
  },
  "Customer AS": {
    dashboards: [0, 0, 0, 0, 4]
  }
};

const USERS_RAW = {
  "Customer A": [2, 1, 2, 2, 2],
  "Customer B": [1, 1, 1, 1, 0],
  "Customer C": [1, 0, 1, 1, 1],
  "Customer D": [6, 4, 4, 4, 5],
  "Customer E": [1, 1, 1, 1, 1],
  "Customer F": [3, 3, 4, 4, 4],
  "Customer G": [1, 1, 1, 1, 1],
  "Customer H": [1, 1, 1, 1, 1],
  "Customer I": [1, 0, 1, 0, 1],
  "Customer J": [2, 2, 1, 1, 1],
  "Customer K": [1, 1, 1, 1, 1],
  "Customer L": [2, 3, 2, 2, 2],
  "Customer M": [2, 3, 2, 1, 1],
  "Customer N": [0, 0, 0, 1, 0],
  "Customer O": [2, 3, 3, 3, 2],
  "Customer P": [1, 1, 1, 3, 3],
  "Customer Q": [1, 2, 1, 2, 1],
  "Customer R": [8, 5, 8, 5, 3],
  "Customer S": [5, 4, 1, 4, 4],
  "Customer T": [3, 2, 2, 2, 1],
  "Customer U": [1, 0, 0, 0, 0],
  "Customer V": [15, 20, 15, 15, 21],
  "Customer W": [0, 0, 0, 0, 0],
  "Customer X": [1, 0, 0, 0, 0],
  "Customer Y": [1, 1, 0, 1, 1],
  "Customer Z": [1, 0, 1, 0, 0],
  "Customer AA": [2, 1, 1, 1, 1],
  "Customer AB": [1, 1, 1, 1, 1],
  "Customer AC": [4, 5, 4, 4, 4],
  "Customer AD": [0, 3, 2, 2, 2],
  "Customer AE": [1, 2, 2, 1, 1],
  "Customer AF": [4, 4, 4, 4, 4],
  "Customer AG": [0, 0, 1, 0, 1],
  "Customer AH": [2, 1, 1, 1, 2],
  "Customer AI": [11, 12, 13, 13, 13],
  "Customer AJ": [4, 4, 3, 3, 3],
  "Customer AK": [0, 1, 0, 1, 0],
  "Customer AL": [2, 3, 3, 4, 3],
  "Customer AM": [1, 1, 2, 1, 3],
  "Customer AN": [1, 2, 3, 2, 4],
  "Customer AO": [1, 1, 1, 0, 0],
  "Customer AP": [1, 0, 0, 0, 0],
  "Customer AQ": [0, 0, 0, 1, 0],
  "Customer AR": [0, 0, 0, 0, 3],
  "Customer AS": [0, 0, 0, 0, 1]
};

const STATUS = {
  "Customer A": "🟢",
  "Customer B": "🟢",
  "Customer C": "🟢",
  "Customer D": "🟢",
  "Customer E": "🔴",
  "Customer F": "🟢",
  "Customer G": "🟢",
  "Customer H": "🟢",
  "Customer I": "🟢",
  "Customer J": "🔴",
  "Customer K": "🟢",
  "Customer L": "🟡",
  "Customer M": "🟢",
  "Customer N": "🔴",
  "Customer O": "🔴",
  "Customer P": "🟢",
  "Customer Q": "🟢",
  "Customer R": "🔴",
  "Customer S": "🟡",
  "Customer T": "🔴",
  "Customer U": "🔴",
  "Customer V": "🟢",
  "Customer W": "🔴",
  "Customer X": "🔴",
  "Customer Y": "🟢",
  "Customer Z": "🔴",
  "Customer AA": "🟢",
  "Customer AB": "🟢",
  "Customer AC": "🟢",
  "Customer AD": "🔴",
  "Customer AE": "🔴",
  "Customer AF": "🟡",
  "Customer AG": "🟢",
  "Customer AH": "🟡",
  "Customer AI": "🟡",
  "Customer AJ": "🟡",
  "Customer AK": "🔴",
  "Customer AL": "🟢",
  "Customer AM": "🟢",
  "Customer AN": "🟢",
  "Customer AO": "🔴",
  "Customer AP": "🔴",
  "Customer AQ": "🔴",
  "Customer AR": "🟢",
  "Customer AS": "🟢"
};

const RECOVERY = {
  "Customer A": false,
  "Customer B": false,
  "Customer C": false,
  "Customer D": false,
  "Customer E": false,
  "Customer F": false,
  "Customer G": false,
  "Customer H": false,
  "Customer I": false,
  "Customer J": false,
  "Customer K": false,
  "Customer L": false,
  "Customer M": false,
  "Customer N": false,
  "Customer O": false,
  "Customer P": false,
  "Customer Q": false,
  "Customer R": false,
  "Customer S": false,
  "Customer T": false,
  "Customer U": false,
  "Customer V": true,
  "Customer W": false,
  "Customer X": false,
  "Customer Y": false,
  "Customer Z": false,
  "Customer AA": false,
  "Customer AB": false,
  "Customer AC": false,
  "Customer AD": false,
  "Customer AE": false,
  "Customer AF": false,
  "Customer AG": false,
  "Customer AH": false,
  "Customer AI": false,
  "Customer AJ": false,
  "Customer AK": false,
  "Customer AL": false,
  "Customer AM": false,
  "Customer AN": false,
  "Customer AO": false,
  "Customer AP": false,
  "Customer AQ": false,
  "Customer AR": false,
  "Customer AS": false
};
