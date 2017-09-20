/*global define*/
define([
        '../../Core/Cartesian3',
        '../../Core/defaultValue',
        '../../Core/defined',
        '../../Core/defineProperties',
        '../../Core/DeveloperError',
        '../../Core/Matrix4',
        '../../Core/Rectangle',
        '../../Scene/Camera',
        '../../Scene/SceneMode',
        '../../ThirdParty/knockout',
        '../createCommand'
    ], function(
        Cartesian3,
        defaultValue,
        defined,
        defineProperties,
        DeveloperError,
        Matrix4,
        Rectangle,
        Camera,
        SceneMode,
        knockout,
        createCommand) {
    'use strict';

    //var pitchScratch = new Cartesian3();

    var HomePlanetButtonViewModel = function(scene, duration) {

        this.tooltip = 'View Home planet';
        knockout.track(this, ['tooltip']);
    };

    return HomePlanetButtonViewModel;
});
