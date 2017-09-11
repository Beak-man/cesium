define([
    './Cartesian3',
    './Cartographic',
    './defaultValue',
    './defined',
    './defineProperties',
    './DeveloperError',
    './Ellipsoid'
], function (
        Cartesian3,
        Cartographic,
        defaultValue,
        defined,
        defineProperties,
        DeveloperError,
        Ellipsoid) {
    'use strict';

    /**
     * A simple map projection where longitude and latitude are linearly mapped to X and Y by multiplying
     * them by the {@link Ellipsoid#maximumRadius}.  This projection
     * is commonly known as geographic, equirectangular, equidistant cylindrical, or plate carrée.  It
     * is also known as EPSG:4326.
     *
     * @alias GeographicProjection
     * @constructor
     *
     * @param {Ellipsoid} [ellipsoid=Ellipsoid.WGS84] The ellipsoid.
     *
     * @see WebMercatorProjection
     */
    function GeographicProjection(ellipsoid) {

        /*	console.log("************* Ellipsoid depuis GeographicProjection *********************");
         console.log(ellipsoid);
         console.log("*************************************************************************");
         */

        // d�finition de l'ellipsoid

        this._ellipsoid = defaultValue(ellipsoid, Ellipsoid.WGS84); // ellipsoid
        this._semimajorAxis = this._ellipsoid.maximumRadius; // rayon max
        this._oneOverSemimajorAxis = 1.0 / this._semimajorAxis; // 1/R

    }

    // a modifier

    defineProperties(GeographicProjection.prototype, {
        /**
         * Gets the {@link Ellipsoid}.
         *
         * @memberof GeographicProjection.prototype
         *
         * @type {Ellipsoid}
         * @readonly
         */
        ellipsoid: {
            get: function () {
                return this._ellipsoid;
            },
            /* ************************************************* NEW ***************************************************** */

            set: function (ellipsoid) {
                this._ellipsoid = ellipsoid;
            }
            /* *********************************************************************************************************** */
        }
    });

    /**
     * Projects a set of {@link Cartographic} coordinates, in radians, to map coordinates, in meters.
     * X and Y are the longitude and latitude, respectively, multiplied by the maximum radius of the
     * ellipsoid.  Z is the unmodified height.
     *
     * @param {Cartographic} cartographic The coordinates to project.
     * @param {Cartesian3} [result] An instance into which to copy the result.  If this parameter is
     *        undefined, a new instance is created and returned.
     * @returns {Cartesian3} The projected coordinates.  If the result parameter is not undefined, the
     *          coordinates are copied there and that instance is returned.  Otherwise, a new instance is
     *          created and returned.
     */
    GeographicProjection.prototype.project = function (cartographic, result) {
        // Actually this is the special case of equidistant cylindrical called the plate carree
        var semimajorAxis = this._semimajorAxis;


        // console.log("dans project de GeographicProjection");


        // console.log(cartographic);

        //  ======== CLACUL POUR LA PROJECTION CLASSIQUE : NE PAS EFFACER =========



        var x = cartographic.longitude * semimajorAxis;
        var y = cartographic.latitude * semimajorAxis;
        var z = cartographic.height;

        //  ==================== Projection Sinusoidale ===============================


        /*    var phi = cartographic.longitude;
         var theta = cartographic.latitude;
         
         var x = ((phi * Math.cos(theta))) / (2.0 * Math.PI);
         var y = (theta / (Math.PI));
         var z = cartographic.height;
         
         x = x * semimajorAxis;
         y = y * semimajorAxis;
         
         */

        // ===================== Projection stereographique ======================

        /*  var argum = (Math.PI / 2.0 - theta) / 2.0;
         var Rtheta = Math.tan(argum);
         
         var x = Rtheta * Math.sin(phi) / 2;
         var y = -Rtheta * Math.cos(phi) / 2;
         var z = cartographic.height;
         
         x = x * semimajorAxis;
         y = y * semimajorAxis;*/

        if (!defined(result)) {
            return new Cartesian3(x, y, z);
        }

        result.x = x;
        result.y = y;
        result.z = z;


        //  console.log(result);

        return result;
    };

    /**
     * Unprojects a set of projected {@link Cartesian3} coordinates, in meters, to {@link Cartographic}
     * coordinates, in radians.  Longitude and Latitude are the X and Y coordinates, respectively,
     * divided by the maximum radius of the ellipsoid.  Height is the unmodified Z coordinate.
     *
     * @param {Cartesian3} cartesian The Cartesian position to unproject with height (z) in meters.
     * @param {Cartographic} [result] An instance into which to copy the result.  If this parameter is
     *        undefined, a new instance is created and returned.
     * @returns {Cartographic} The unprojected coordinates.  If the result parameter is not undefined, the
     *          coordinates are copied there and that instance is returned.  Otherwise, a new instance is
     *          created and returned.
     */
    GeographicProjection.prototype.unproject = function (cartesian, result) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(cartesian)) {
            throw new DeveloperError('cartesian is required');
        }
        //>>includeEnd('debug');

        var oneOverSemimajorAxis = this._oneOverSemimajorAxis;

        //  ======== CLACUL POUR LA PROJECTION CLASSIQUE : NE PAS EFFACER =========


        var longitude = cartesian.x * oneOverSemimajorAxis;
        var latitude = cartesian.y * oneOverSemimajorAxis;
        var height = cartesian.z;


        //  ====================================================================


        // ==========================Sinusoidale ==============================


        /*  var longitude = ((cartesian.x * 2.0 * Math.PI)) / (Math.cos(cartesian.y)) * oneOverSemimajorAxis;
         var latitude = cartesian.y * Math.PI * oneOverSemimajorAxis;
         var height = cartesian.z;*/

        // ======================== Stereographique ============================

        /*   var sqrtTerme = Math.sqrt(cartesian.x*cartesian.x + cartesian.y*cartesian.y)
         var atanTerme = Math.atan(4.0*sqrtTerme);
         
         var latitude = Math.PI/2.0 - atanTerme;
         var longitude = Math.atan2(cartesian.x, cartesian.y);
         var height = cartesian.z;*/

        if (!defined(result)) {
            return new Cartographic(longitude, latitude, height);
        }

        result.longitude = longitude;
        result.latitude = latitude;
        result.height = height;

        return result;
    };

    return GeographicProjection;
});
