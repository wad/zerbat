define([
    'app/constants',
    'app/gameContext'], function (c, gx) {

    var Map = {};

    Map.isPositionWithinMinimapBoundary = function (pos) {
        return pos[X] >= gx.gs.playerLocation[X] - c.MINIMAP_CENTER_POS[X] &&
            pos[X] < gx.gs.playerLocation[X] + c.MINIMAP_CENTER_POS[X] &&
            pos[Y] >= gx.gs.playerLocation[Y] - c.MINIMAP_CENTER_POS[Y] &&
            pos[Y] < gx.gs.playerLocation[Y] + c.MINIMAP_CENTER_POS[Y];
    };

    Map.showIcon = function (iconIndex, pos) {
        if (Map.isPositionWithinMinimapBoundary(pos)) {
            gx.minimapContext.drawImage(
                gx.iconImage,
                0, iconIndex,
                c.ICON_SIZE[X], c.ICON_SIZE[Y],
                (c.MINIMAP_CENTER_POS[X] + pos[X] - gx.gs.playerLocation[X]) - (c.ICON_SIZE[X] >> 1),
                (c.MINIMAP_CENTER_POS[Y] + pos[Y] - gx.gs.playerLocation[Y]) - (c.ICON_SIZE[Y] >> 1),
                c.ICON_SIZE[X], c.ICON_SIZE[Y]);
        } else {
            gx.mapContextOverland.drawImage(
                gx.iconImage,
                0, iconIndex,
                c.ICON_SIZE[X], c.ICON_SIZE[Y],
                (pos[X] / c.ZOOM_FACTOR) - (c.ICON_SIZE[X] >> 1),
                (pos[Y] / c.ZOOM_FACTOR) - (c.ICON_SIZE[Y] >> 1),
                c.ICON_SIZE[X], c.ICON_SIZE[Y]);
        }
    };

    Map.drawVisibleIcons = function () {
        var max = c._computeBlockCoordinatesFromMapCoordinates(c.MAP_DETAIL_SIZE_IN_PIXELS);
        for (var x = 0; x < max[X]; x++) {
            for (var y = 0; y < max[Y]; y++) {
                var block = gx.gs.blocks[c.convertBlockCoordinatesToKey([x, y])];
                if (block !== undefined) {
                    block.places.forEach(function (place) {
                        if (place.isOnPlayerCharactersMap) {
                            Map.showIcon(place.iconIndex, place.coordinates);
                        }
                    });
                }
            }
        }
    };

    Map.refreshMap = function () {
        Map.refreshMinimap();
        gx.mapContextOverland.drawImage(gx.mapImageOverland, 0, 0);
        Map.drawVisibleIcons();
        Map.drawOverlandMapPlayerBox();
    };

    Map.identifyTerrainType = function (pos) {
        var context;
        var max;
        context = gx.terrainContext;
        max = [c.MAP_DETAIL_SIZE_IN_PIXELS[X], c.MAP_DETAIL_SIZE_IN_PIXELS[Y]];
        if (pos[X] >= 0 && pos[X] < max[X] && pos[Y] >= 0 && pos[Y] < max[Y]) {
            var imageData = context.getImageData(pos[X], pos[Y], 1, 1);
            if (imageData.width * imageData.height > 0) {
                var pixels = imageData.data;
                var pixelColor = c.rgbToHex([pixels[c.R], pixels[c.G], pixels[c.B]]);
                for (var terrainTypeIndex = 0; terrainTypeIndex < c.TERRAIN_TYPE_COLORS.length; terrainTypeIndex++) {
                    if (c.TERRAIN_TYPE_COLORS[terrainTypeIndex] === pixelColor) {
                        return terrainTypeIndex;
                    }
                }
                throw "unexpected color found: " + pixelColor + " at " + pos[X] + "," + pos[Y];
            }
        }
        return c.TERRAIN_TYPE_UNKNOWN;
    };

    Map.setupMap = function (mapClickHandler, minimapClickHandler) {
        // should not use jQuery here, this is already an HTML5 javascript object.
        var mapCanvasOverland = document.getElementById("canvasMap");

        mapCanvasOverland.width = c.MAP_OVERLAND_SIZE_IN_PIXELS[X];
        mapCanvasOverland.height = c.MAP_OVERLAND_SIZE_IN_PIXELS[Y];
        mapCanvasOverland.addEventListener("mousedown", mapClickHandler, false);
        if (!mapCanvasOverland.getContext) {
            throw("Failed to get overland map context. This isn't going to work. You probably just need a better browser.");
        }
        gx.mapContextOverland = mapCanvasOverland.getContext("2d");

        var minimapCanvas = document.getElementById("canvasMinimap");
        minimapCanvas.width = c.MINIMAP_SIZE_IN_PIXELS[X];
        minimapCanvas.height = c.MINIMAP_SIZE_IN_PIXELS[Y];
        minimapCanvas.addEventListener("mousedown", minimapClickHandler, false);
        if (!minimapCanvas.getContext) {
            throw("Failed to get minimap context. This isn't going to work. You probably just need a better browser.");
        }
        gx.minimapContext = minimapCanvas.getContext("2d");

        var terrainCanvas = document.createElement("canvas");
        terrainCanvas.width = c.MAP_DETAIL_SIZE_IN_PIXELS[X];
        terrainCanvas.height = c.MAP_DETAIL_SIZE_IN_PIXELS[Y];
        minimapCanvas.parentNode.appendChild(terrainCanvas);
        terrainCanvas.style.display = "none";
        gx.terrainContext = terrainCanvas.getContext("2d");
        gx.terrainContext.drawImage(gx.mapImageTerrain, 0, 0);
    };

    Map.drawMinimapTerrain = function () {
        gx.minimapContext.drawImage(
            gx.mapImageDetail,
            gx.gs.playerLocation[X] - c.MINIMAP_CENTER_POS[X],
            gx.gs.playerLocation[Y] - c.MINIMAP_CENTER_POS[Y],
            c.MINIMAP_SIZE_IN_PIXELS[X], c.MINIMAP_SIZE_IN_PIXELS[Y],
            0, 0,
            c.MINIMAP_SIZE_IN_PIXELS[X], c.MINIMAP_SIZE_IN_PIXELS[Y]);
    };

    Map.drawOverlandMapPlayerBox = function () {
        gx.mapContextOverland.strokeStyle = "#ff0000";
        gx.mapContextOverland.strokeRect(
            (gx.gs.playerLocation[X] - c.MINIMAP_CENTER_POS[X]) / c.ZOOM_FACTOR,
            (gx.gs.playerLocation[Y] - c.MINIMAP_CENTER_POS[Y]) / c.ZOOM_FACTOR,
            c.MINIMAP_SIZE_IN_PIXELS[X] / c.ZOOM_FACTOR,
            c.MINIMAP_SIZE_IN_PIXELS[Y] / c.ZOOM_FACTOR
        );
    };

    Map.drawMinimapPlayerMarker = function () {
        var crosshairLength = 20;
        var gapRadius = 6;
        gx.minimapContext.fillStyle = "#ff3333";

        // center dot
        gx.minimapContext.fillRect(
            c.MINIMAP_CENTER_POS[X] - 1,
            c.MINIMAP_CENTER_POS[Y] - 1,
            1,
            1);

        // left hair
        gx.minimapContext.fillRect(
            c.MINIMAP_CENTER_POS[X] - crosshairLength - gapRadius - 1,
            c.MINIMAP_CENTER_POS[Y] - 1,
            crosshairLength,
            1);

        // right hair
        gx.minimapContext.fillRect(
            c.MINIMAP_CENTER_POS[X] + gapRadius - 1,
            c.MINIMAP_CENTER_POS[Y] - 1,
            crosshairLength,
            1);

        // top hair
        gx.minimapContext.fillRect(
            c.MINIMAP_CENTER_POS[X] - 1,
            c.MINIMAP_CENTER_POS[Y] - crosshairLength - gapRadius - 1,
            1,
            crosshairLength);

        // bottom hair
        gx.minimapContext.fillRect(
            c.MINIMAP_CENTER_POS[X] - 1,
            c.MINIMAP_CENTER_POS[Y] + gapRadius - 1,
            1,
            crosshairLength);
    };

    Map.refreshMinimap = function () {
        Map.drawMinimapTerrain();
        Map.drawMinimapPlayerMarker();
    };

    Map.clickMap = function (event) {
        return [
            event.offsetX * c.ZOOM_FACTOR,
            event.offsetY * c.ZOOM_FACTOR ];
    };

    Map.clickMinimap = function (event) {
        var locationClicked = [
            gx.gs.playerLocation[X] + event.offsetX - c.MINIMAP_CENTER_POS[X],
            gx.gs.playerLocation[Y] + event.offsetY - c.MINIMAP_CENTER_POS[Y]];
        if (locationClicked[X] < 0) {
            locationClicked[X] = 0;
        }
        if (locationClicked[Y] < 0) {
            locationClicked[Y] = 0;
        }
        if (locationClicked[X] >= c.MAP_DETAIL_SIZE_IN_PIXELS[X]) {
            locationClicked[X] = c.MAP_DETAIL_SIZE_IN_PIXELS[X] - 1;
        }
        if (locationClicked[Y] >= c.MAP_DETAIL_SIZE_IN_PIXELS[Y]) {
            locationClicked[Y] = c.MAP_DETAIL_SIZE_IN_PIXELS[Y] - 1;
        }
        return locationClicked;
    };

    return Map;
});
