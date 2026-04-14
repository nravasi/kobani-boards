var TEAM_ICON_BASE_URL = 'https://api.promiedos.com.ar/images/team';

var PRIMERA_DIVISION_TEAMS = {
  'ihb':   'Argentinos Juniors',
  'gbfc':  'Atlético Tucumán',
  'ihi':   'Banfield',
  'jafb':  'Barracas Central',
  'fhid':  'Belgrano',
  'igg':   'Boca Juniors',
  'beafh': 'Central Córdoba SdE',
  'hcbh':  'Defensa y Justicia',
  'bbjea': 'Deportivo Riestra',
  'igh':   'Estudiantes LP',
  'iia':   'Gimnasia LP',
  'ihd':   'Godoy Cruz',
  'iie':   'Huracán',
  'ihe':   'Independiente',
  'hcch':  'Independiente Rivadavia',
  'hchc':  'Instituto',
  'igj':   'Lanús',
  'ihh':   "Newell's Old Boys",
  'hcah':  'Platense',
  'ihg':   'Racing Club',
  'igi':   'River Plate',
  'ihf':   'Rosario Central',
  'igf':   'San Lorenzo',
  'hbbh':  'Sarmiento Junín',
  'jche':  'Talleres de Córdoba',
  'iid':   'Tigre',
  'hcag':  'Unión de Santa Fe',
  'ihc':   'Vélez Sarsfield',
  'hccd':  'Aldosivi',
  'bheaf': 'Estudiantes RC',
  'bbjbf': 'Gimnasia de Mendoza'
};

var FALLBACK_ICON = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">' +
  '<circle cx="16" cy="16" r="14" fill="#1a1a2e" stroke="#a0a0b0" stroke-width="2"/>' +
  '<text x="16" y="21" text-anchor="middle" font-size="14" fill="#a0a0b0" font-family="sans-serif">?</text>' +
  '</svg>'
);

var iconCache = {};

function buildIconUrl(teamId, size) {
  return TEAM_ICON_BASE_URL + '/' + teamId + '/' + (size || 1);
}

function getTeamIcon(teamId, size) {
  if (!teamId || typeof teamId !== 'string') {
    return FALLBACK_ICON;
  }

  var cacheKey = teamId + ':' + (size || 1);
  if (iconCache[cacheKey]) {
    return iconCache[cacheKey];
  }

  var isKnown = PRIMERA_DIVISION_TEAMS.hasOwnProperty(teamId);
  var url = isKnown ? buildIconUrl(teamId, size) : FALLBACK_ICON;

  iconCache[cacheKey] = url;
  return url;
}

function getTeamName(teamId) {
  return PRIMERA_DIVISION_TEAMS[teamId] || null;
}

function getAllTeams() {
  var teams = [];
  var ids = Object.keys(PRIMERA_DIVISION_TEAMS);
  for (var i = 0; i < ids.length; i++) {
    teams.push({
      id: ids[i],
      name: PRIMERA_DIVISION_TEAMS[ids[i]],
      iconUrl: buildIconUrl(ids[i], 1)
    });
  }
  return teams;
}

function clearCache() {
  iconCache = {};
}

function getCacheSize() {
  return Object.keys(iconCache).length;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getTeamIcon: getTeamIcon,
    getTeamName: getTeamName,
    getAllTeams: getAllTeams,
    clearCache: clearCache,
    getCacheSize: getCacheSize,
    PRIMERA_DIVISION_TEAMS: PRIMERA_DIVISION_TEAMS,
    FALLBACK_ICON: FALLBACK_ICON,
    TEAM_ICON_BASE_URL: TEAM_ICON_BASE_URL
  };
} else if (typeof window !== 'undefined') {
  window.TeamIcons = {
    getTeamIcon: getTeamIcon,
    getTeamName: getTeamName,
    getAllTeams: getAllTeams,
    clearCache: clearCache,
    getCacheSize: getCacheSize,
    PRIMERA_DIVISION_TEAMS: PRIMERA_DIVISION_TEAMS,
    FALLBACK_ICON: FALLBACK_ICON,
    TEAM_ICON_BASE_URL: TEAM_ICON_BASE_URL
  };
}
