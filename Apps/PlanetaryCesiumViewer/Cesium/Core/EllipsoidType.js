/*global define*/
define([ './freezeObject','./Math'], function(freezeObject, CesiumMath) { 

    var EllipsoidType = function(Ellipsoid, endUserOptions){

        if (typeof endUserOptions === 'undefined') {
            /**
             * An Ellipsoid instance initialized with the WGS84 standard.
             *
             * @type {Ellipsoid}
             * @constant
             */
             Ellipsoid.WGS84 = freezeObject(new Ellipsoid(6378137.0, 6378137.0, 6356752.3142451793));

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
        }  else {	
		
            if (typeof endUserOptions.ellipsoidType !== 'undefined' && endUserOptions.ellipsoidSize !== 'undefined'){

                var ellipsoidName = endUserOptions.ellipsoidType.toString();

                if (ellipsoidName !== "WGS84" && ellipsoidName !== "MOON" && ellipsoidName !== "MARSSPHE" && ellipsoidName !== "MARSIAU2000" && ellipsoidName !== "UNIT_SPHERE"){

                    var ellipsoidSizeString =  endUserOptions.ellipsoidSize.toString();
                    var dimensionSizeTab    =  ellipsoidSizeString.split(",");

                    var dimensions = {			
                        x : parseFloat(dimensionSizeTab[0]),
                        y : parseFloat(dimensionSizeTab[1]),
                        z : parseFloat(dimensionSizeTab[2])
                    }

                    /**
                     * An Ellipsoid instance initialized with customized radii.
                     *
                     * @type {Ellipsoid}
                     * @constant
                     */
                     Ellipsoid[ellipsoidName] = freezeObject(new Ellipsoid(dimensions.x, dimensions.y, dimensions.z));
                }; 
            };
        };
    }
	
	return EllipsoidType;
	
});