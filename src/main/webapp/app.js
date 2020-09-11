import ImageLayer from 'ol/layer/Image';
import Map from 'ol/Map';
import Static from 'ol/source/ImageStatic';
import View from 'ol/View';
import TileLayer from "ol/layer/Tile";
import proj4 from "proj4";
import * as extent from 'ol/extent.js';
import * as proj from 'ol/proj.js';
import * as olProj4 from 'ol/proj/proj4.js';
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import * as wmts from "ol/source/WMTS";
import WMTS from "ol/source/WMTS";

const BELGIAN_LAMBERT_72_PROJECTION = 'EPSG:31370';

const PROJ4_DEFINITION = '+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1 +units=m +no_defs';

proj4.defs(BELGIAN_LAMBERT_72_PROJECTION, PROJ4_DEFINITION);

olProj4.register(proj4);

var view = new View({
  center: [140860.69299028325, 190532.7165957574],
  extent: [9928.000000, 66928.000000, 272072.000000, 329072.000000],
  projection: proj.get('EPSG:31370'),
  resolutions: _createResolutions(
      [9928.000000, 66928.000000, 272072.000000, 329072.000000]),
  zoom: 2,
});

var parser = new WMTSCapabilities();
var wmtsUrl = "http://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts";

var images = ["test", "test2"]
var headers = {
  'Accept': 'application/json',       // receive json
  'Content-Type': 'application/json'  // send json
};

var wmtsCapabilities;
Promise.all(
    [fetch(wmtsUrl
        + "?request=getcapabilities&service=wmts&version=1.0.0")].concat(
        images.map(imageName => fetch("/geotiff/" + imageName + "/metadata", {headers: headers})))).then(
    response => {
      Promise.all([response[0].text()].concat(
          response.slice(1).map(jsonResponse => jsonResponse.json()))).then(textAndJson => {
            var text = textAndJson[0];
            var json = textAndJson.slice(1);
        wmtsCapabilities = parser.read(text);

        var layer1 = _createTileLayer(
            _loadWMTSOptions(wmtsCapabilities, "grb_bsk_grijs", "BPL72VL"),
            0);

        var layers = [layer1].concat(json.map((j,i) => {
          _createImageLayer(json, 1, images[i])
        }))

        var map = new Map({
          layers: layers,
          target: 'map',
          view: view
        });
      })
    })

function _createTileLayer(options, zIndex) {
  options.crossOrigin = 'anonymous';
  return new TileLayer({
    visible: true,
    source: new WMTS(options),
    zIndex: zIndex,
  });
}

function _createImageLayer(options, zIndex, imageName) {
  return new ImageLayer({
    visible: true,
    source: new Static({
      url: '/' + imageName,
      imageExtent: options.extent,
    }),
    zIndex: zIndex,
  });
}

function _loadWMTSOptions(capabilities, layerName, matrixSet) {
  const wmtsOptions = wmts.optionsFromCapabilities(capabilities, {
    layer: layerName,
    matrixSet: matrixSet,
  });
  _updateWMTSOptions(wmtsOptions);
  return wmtsOptions;
}

function _updateWMTSOptions(options) {
  options.crossOrigin = 'anonymous';
}

function _createResolutions(bbox) {
  const MAX_RESOLUTION = extent.getHeight(bbox) / 256;

  // Generate a sequence of numbers
  // Since the array is initialized with `undefined` on each position,
  // the value of `elementValue` below will be `undefined`
  return Array.from(Array(16),
      (elementValue, elementIndex) => MAX_RESOLUTION / Math.pow(2,
          elementIndex));
}

