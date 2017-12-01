/*global define*/
define([
    '../../Core/defineProperties'
], function (
        defineProperties
        ) {
    'use strict';
    var ConfigurationFile = function () {


        var configuration = {
            'homePlanet': 'mars',
            'servers': {

                'USGSserver': {
                    'name': 'Planetary maps (USGS)',
                    'url': 'https://planetarymaps.usgs.gov/cgi-bin/mapserv',
                    'dir': '/maps/',
                    'extension': ['_simp_cyl.map', '_npole.map', '_spole.map']
                },
                'server2': {
                    'name': 'Planetary maps (USGS)',
                    'url': 'https://planetarymaps.usgs.gov/cgi-bin/mapserv',
                    'dir': '/maps/',
                    'extension': '_simp_cyl_quads.map',
                    'format': 'png'
                },
                'VOServers': {

                    'venus': [
                        {
                            'name': 'voparis-cdpp',
                            'url': 'http://voparis-tap-planeto.obspm.fr/__system__/tap/run/tap/sync',
                            'dir': './',
                            'extension': ['vvex.epn_core']
                        }
                    ],
                    'titan': [
                        {
                            'name': 'voparis-cdpp',
                            'url': 'http://voparis-tap-planeto.obspm.fr/__system__/tap/run/tap/sync',
                            'dir': './',
                            'extension': ['titan.epn_core']
                        },
                        {
                            'name': 'dc.zah.uni-heidelberg.de',
                            'url': 'http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap/sync',
                            'dir': './',
                            'extension': ['titan.epn_core']

                        }
                    ],
                    'mars': [
                        {
                            'name': 'vo Jacobs University',
                            'url': 'http://epn1.epn-vespa.jacobs-university.de/__system__/tap/run/tap/sync',
                            'dir': './',
                            'extension': ['mars_craters.epn_core', 'mars_craters_lagain.epn_core', 'crism.epn_core']
                        }
                    ]
                }

            },
            'planetarySystem': {
                'system': {
                    'mercury': ['mercury'],
                    'venus': ['venus'],
                    'earth': ['earth', 'moon'],
                    'mars': ['mars', 'deimos', 'phobos'],
                    'jupiter': ['jupiter', 'ganymede', 'callisto', 'io', 'europa'],
                    'saturn': ['saturn', 'titan', 'rhea', 'lapetus', 'dione', 'tethys', 'enceladus', 'mimas'],
                    'uranus': ['uranus', 'titania', 'oberon', 'umbriel', 'ariel', 'miranda'],
                    'neptune': ['neptune', 'triton']
                },
                'dimension': {
                    'mercurySystem': {
                        'mercury': {
                            'x': 2497000.0,
                            'y': 2497000.0,
                            'z': 2497000.0
                        }
                    },
                    'venusSystem': {
                        'venus': {
                            'x': 7051000.8,
                            'y': 7051000.8,
                            'z': 7051000.8
                        }
                    },
                    'earthSystem': {
                        'earth': {
                            'x': 6378137.0,
                            'y': 6378137.0,
                            'z': 6356752.3
                        },
                        'moon': {
                            'x': 1737400.0,
                            'y': 1737400.0,
                            'z': 1735970.0
                        }
                    },
                    'marsSystem': {
                        'mars': {
                            'x': 3396190.0,
                            'y': 3396190.0,
                            'z': 3376200.0
                        },
                        'deimos': {
                            'x': 1500000.0,
                            'y': 1200000.0,
                            'z': 1000000.0
                        },
                        'phobos': {
                            'x': 2700000.0,
                            'y': 2160000.0,
                            'z': 1880000.0
                        }
                    },
                    'jupiterSystem': {
                        'jupiter': {
                            'x': 71492000.0,
                            'y': 71492000.0,
                            'z': 66864000.0
                        },
                        'ganymede': {
                            'x': 5262400.0,
                            'y': 5262400.0,
                            'z': 5262400.0
                        },
                        'callisto': {
                            'x': 4820300.0,
                            'y': 4820300.0,
                            'z': 4820300.0
                        },
                        'io': {
                            'x': 3643200.0,
                            'y': 3643200.0,
                            'z': 3643200.0
                        },
                        'europa': {
                            'x': 3121600.0,
                            'y': 3121600.0,
                            'z': 3121600.0
                        }
                    },
                    'saturnSystem': {
                        'saturn': {
                            'x': 60268000.0,
                            'y': 60268000.0,
                            'z': 54359000.0
                        },
                        'titan': {
                            'x': 5151000.0,
                            'y': 5151000.0,
                            'z': 5151000.0
                        },
                        'rhea': {
                            'x': 1529000.0,
                            'y': 1529000.0,
                            'z': 1529000.0
                        },
                        'lapetus': {
                            'x': 1494800.0,
                            'y': 1494800.0,
                            'z': 1424800.0
                        },
                        'dione': {
                            'x': 1118000.0,
                            'y': 1118000.0,
                            'z': 1118000.0
                        },
                        'tethys': {
                            'x': 1072000.0,
                            'y': 1056000.0,
                            'z': 1052000.0
                        },
                        'enceladus': {
                            'x': 513000.0,
                            'y': 503000.0,
                            'z': 497000.0
                        },
                        'mimas': {
                            'x': 413200.0,
                            'y': 391500.0,
                            'z': 381000.0
                        }
                    },
                    'uranusSystem': {
                        'uranus': {
                            'x': 25559000.0,
                            'y': 25559000.0,
                            'z': 23562000.0
                        },
                        'titania': {
                            'x': 788400.0,
                            'y': 788400.0,
                            'z': 788400.0
                        },
                        'oberon': {
                            'x': 761400.0,
                            'y': 761400.0,
                            'z': 761400.0
                        },
                        'umbriel': {
                            'x': 1169000.0,
                            'y': 1169000.0,
                            'z': 1169000.0
                        },
                        'ariel': {
                            'x': 1162000.0,
                            'y': 1156000.0,
                            'z': 1155000.0
                        },
                        'miranda': {
                            'x': 480000.0,
                            'y': 468000.0,
                            'z': 465800.0
                        }
                    },
                    'neptuneSystem': {
                        'neptune': {
                            'x': 24764000.0,
                            'y': 24764000.0,
                            'z': 24341000.0
                        },
                        'triton': {
                            'x': 2706800.0,
                            'y': 2706800.0,
                            'z': 2706800.0
                        }
                    }
                }
            }
        };

        this._configuration = configuration;


    };
    defineProperties(ConfigurationFile.prototype, {

        config: {
            get: function () {
                return this._configuration;
            }
        }
    });
    return ConfigurationFile;
});
