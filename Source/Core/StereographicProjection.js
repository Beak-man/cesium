/*global define*/
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
     * A map projection
     *
     * @alias StereographicProjection
     * @constructor
     *
     * @param {Ellipsoid} [ellipsoid=Ellipsoid.WGS84] The ellipsoid.
     *
     * @see WebMercatorProjection
     */
    function StereographicProjection(ellipsoid) {
        
        console.log("dans constructeur de SterographicProjection");

        this._ellipsoid = defaultValue(ellipsoid, Ellipsoid.WGS84); // ellipsoid
        this._semimajorAxis = this._ellipsoid.maximumRadius; // rayon max
        this._oneOverSemimajorAxis = 1.0 / this._semimajorAxis; // 1/R
    }

    defineProperties(StereographicProjection.prototype, {
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
            set: function (ellipsoid) {
                this._ellipsoid = ellipsoid;
            },
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
    StereographicProjection.prototype.project = function (cartographic, result) {
        // Actually this is the special case of equidistant cylindrical called the plate carree
        var semimajorAxis = this._semimajorAxis;
        
        console.log("dans project de SterographicProjection");

        //  ======== CLACUL POUR LA PROJECTION CLASSIQUE : NE PAS EFFACER =========

          var x = cartographic.longitude * semimajorAxis;
          var y = cartographic.latitude * semimajorAxis;
          var z = cartographic.height;

        //  =======================================================================

     /*   var radeg = 180.0 / Math.PI;

        var theta = cartographic.latitude;
        var phi = cartographic.longitude;*/
        
      //  console.log(theta+" "+phi);

      //   var angle = ((90.0 / radeg) - theta) / 2.0;

      //  var R = Math.tan(angle) * semimajorAxis;

      /*  var x = R * Math.sin(phi);
        var y = -R * Math.cos(phi);    */
        
      /*  var x = theta*Math.cos(phi)* semimajorAxis;
        var y = phi* semimajorAxis;        
        
        var z = cartographic.height;*/

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
    StereographicProjection.prototype.unproject = function (cartesian, result) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(cartesian)) {
            throw new DeveloperError('cartesian is required');
        }
        //>>includeEnd('debug');

        var oneOverEarthSemimajorAxis = this._oneOverSemimajorAxis;

        //  ======== CLACUL POUR LA PROJECTION CLASSIQUE : NE PAS EFFACER =========

          var longitude = cartesian.x * oneOverEarthSemimajorAxis;
          var latitude = cartesian.y * oneOverEarthSemimajorAxis;
          var height = cartesian.z;

        //  =======================================================================

       /* console.log("inverse");*/
      /*  var radeg = 180.0 / Math.PI;
    
        var height = cartesian.z;

        var x = cartesian.x;
        var y = cartesian.y;

        var R = Math.sqrt(x * x + y * y);
        var latitude = (90.0 / radeg - 2.0 * Math.atan2(2, R))* oneOverEarthSemimajorAxis;
        var longitude = (Math.atan2(x, -y))* oneOverEarthSemimajorAxis;*/
        
         
         var longitude = cartesian.y * oneOverEarthSemimajorAxis;
         var latitude = (cartesian.x/Math.cos(longitude)) * oneOverEarthSemimajorAxis;
         var height = cartesian.z; 

        if (!defined(result)) {
            return new Cartographic(longitude, latitude, height);
        }

        result.longitude = longitude;
        result.latitude = latitude;
        result.height = height;
        
        return result;
    };

    return StereographicProjection;
});
