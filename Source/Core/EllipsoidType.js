/*global define*/
define([
        './freezeObject',
        './Math'
    ], function(
        freezeObject,
        CesiumMath) {
'use strict';
    var EllipsoidType = function (Ellipsoid, endUserOptions) {

        if (typeof endUserOptions === 'undefined') {
            /**
             * An Ellipsoid instance initialized with the WGS84 standard.
             *
             * @type {Ellipsoid}
             * @constant
             */
            Ellipsoid.WGS84 = freezeObject(new Ellipsoid(6378137.0, 6378137.0, 6356752.3142451793));
            // Ellipsoid.WGS84 = freezeObject(new Ellipsoid(3396190.0, 3396190.0, 3376200.0));

            /**
             * An Ellipsoid instance initialized to a sphere with the lunar radius.
             *
             * @type {Ellipsoid}
             * @constant
             */
            Ellipsoid.MOON = freezeObject(new Ellipsoid(CesiumMath.LUNAR_RADIUS, CesiumMath.LUNAR_RADIUS, CesiumMath.LUNAR_RADIUS));

            /**
             * An Ellipsoid instance initialized to the Mars IAU 2000 ellipsoid standard.
             * @memberof Ellipsoid
             */
            Ellipsoid.MARSIAU2000 = freezeObject(new Ellipsoid(3396190.0, 3396190.0, 3376200.0));

            /**
             * An Ellipsoid instance initialized to the standard Mars Sphere.
             * @member of Ellipsoid 
             */
            Ellipsoid.MARSSPHE = freezeObject(new Ellipsoid(3396000.0, 3396000.0, 3396000.0));

            /**
             * An Ellipsoid instance initialized to radii of (1.0, 1.0, 1.0).
             *
             * @type {Ellipsoid}
             * @constant
             */
            Ellipsoid.UNIT_SPHERE = freezeObject(new Ellipsoid(1.0, 1.0, 1.0));

        } else {

            if (typeof endUserOptions.ellipsoidType !== 'undefined') {

                if (typeof endUserOptions.ellipsoidSize !== 'undefined') {

                    var ellipsoidName = endUserOptions.ellipsoidType.toString().toUpperCase();

                    if (ellipsoidName !== 'WGS84' && ellipsoidName !== 'MOON' && ellipsoidName !== 'MARSSPHE' && ellipsoidName !== 'MARSIAU2000' && ellipsoidName !== 'UNIT_SPHERE') {

                        var ellipsoidSizeString = endUserOptions.ellipsoidSize.toString();
                        var dimensionSizeTab = ellipsoidSizeString.split(',');

                        var dimensions = {
                            x: parseFloat(dimensionSizeTab[0]),
                            y: parseFloat(dimensionSizeTab[1]),
                            z: parseFloat(dimensionSizeTab[2])
                        };

                        /**
                         * An Ellipsoid instance initialized with customized radii.
                         *
                         * @type {Ellipsoid}
                         * @constant
                         */
                        Ellipsoid[ellipsoidName] = freezeObject(new Ellipsoid(dimensions.x, dimensions.y, dimensions.z));
                    }
                }

                // A NETTOYER

                if (endUserOptions.ellipsoidType.toString().toUpperCase() === 'WGS84' || endUserOptions.ellipsoidType.toString().toUpperCase() === 'EARTHIAU2000') {
                    Ellipsoid.WGS84 = freezeObject(new Ellipsoid(6378137.0, 6378137.0, 6356752.3142451793));
                    //Ellipsoid.WGS84 = freezeObject(new Ellipsoid(3396190.0, 3396190.0, 3376200.0));

                    Ellipsoid.EARTHIAU2000 = freezeObject(new Ellipsoid(6378137.0, 6378137.0, 6356752.3142451793));

                } else if (endUserOptions.ellipsoidType.toString().toUpperCase() === 'JUPITERIAU2000') {
                    Ellipsoid.JUPITERIAU2000 = freezeObject(new Ellipsoid(71492000.0, 71492000.0, 66864000.0));

                } else if (endUserOptions.ellipsoidType.toString().toUpperCase() === 'VENUSIAU2000') {
                    Ellipsoid.VENUSIAU2000 = freezeObject(new Ellipsoid(6051000.8, 6051000.8, 6051000.8));

                } else if (endUserOptions.ellipsoidType.toString().toUpperCase() === 'MARSIAU2000') {
                    Ellipsoid.MARSIAU2000 = freezeObject(new Ellipsoid(3396190.0, 3396190.0, 3376200.0));

                } else if (endUserOptions.ellipsoidType.toString().toUpperCase() === 'MERCURYIAU2000') {
                    Ellipsoid.MERCURYIAU2000 = freezeObject(new Ellipsoid(2497000.0, 2497000.0, 2497000.0));

                } else if (endUserOptions.ellipsoidType.toString().toUpperCase() === 'SATURNIAU2000') {
                    Ellipsoid.SATURNIAU2000 = freezeObject(new Ellipsoid(60268000.0, 60268000.0, 54359000.0));

                } else if (endUserOptions.ellipsoidType.toString().toUpperCase() === 'URANUSIAU2000') {
                    Ellipsoid.URANUSIAU2000 = freezeObject(new Ellipsoid(25559000.0, 25559000.0, 23562000.0));

                } else if (endUserOptions.ellipsoidType.toString().toUpperCase() === 'NEPTUNEIAU2000') {
                    Ellipsoid.NEPTUNEIAU2000 = freezeObject(new Ellipsoid(24764000.0, 24764000.0, 24341000.0));

                } else {
                    Ellipsoid[endUserOptions.ellipsoidType.toString().toUpperCase()] = freezeObject(new Ellipsoid(1000000.0, 1000000.0, 1000000.0));
                }
            }
        }
    };

    return EllipsoidType;

});
