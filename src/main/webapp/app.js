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

var layers = [];

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

var images = [
  "test",
  "test2",
  "wilsele_noord",
  "kriekenbos",
  "l18_mechelsevest",
  "mechelsevest",
  "putkapel",
  "st-jacobswijk",
  "stationsoverkapping", "geertrui",
  "h9_kriekenbos",
  "koningin_astridlaan",
  "kauter"]
var headers = {
  'Accept': 'application/json',       // receive json
  'Content-Type': 'application/json'  // send json
};

var map;

var wmtsCapabilities;

function areaCompareExtent(a, b) {
  let xLengthA = a[2] - a[0];
  let yLengthA = a[3] - a[1];
  let xLengthB = b[2] - b[0];
  let yLengthB = b[3] - b[1];
  if ((xLengthA * yLengthA) > (xLengthB * yLengthB)) {
    return -1;
  }
  if ((xLengthA * yLengthA) < (xLengthB * yLengthB)) {
    return 1;
  }
  return 0;
}

Promise.all(
    [fetch(wmtsUrl
        + "?request=getcapabilities&service=wmts&version=1.0.0")].concat(
        images.map(imageName => fetch("/geotiff/" + encodeURI(imageName) + "/metadata",
            {headers: headers})))).then(
    response => {
      Promise.all([response[0].text()].concat(
          response.slice(1).map(jsonResponse => jsonResponse.json()))).then(
          textAndJson => {
            var text = textAndJson[0];
            var json = textAndJson.slice(1);
            wmtsCapabilities = parser.read(text);

            var layer1 = _createTileLayer(
                _loadWMTSOptions(wmtsCapabilities, "grb_bsk_grijs", "BPL72VL"),
                0);

            let imagesWithMetadata = json.map((j, i) => {return {extent: j.extent, image: images[i]};});
            imagesWithMetadata = imagesWithMetadata.sort((a,b) => {
              return areaCompareExtent(a.extent, b.extent);
            })

            layers = [layer1].concat(imagesWithMetadata.map((im,i) =>
                _createImageLayer(im, i + 1)
            ))

            map = new Map({
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
    title: 'WMS'
  });
}

function _createImageLayer(options, zIndex) {
  let checkButtons = document.querySelector("#checkButtons");
  let inputElement = document.createElement("input");
  inputElement.setAttribute("type", "checkbox");
  inputElement.setAttribute("id", options.image);
  inputElement.setAttribute("name", options.image);
  inputElement.setAttribute("value", options.image);
  inputElement.setAttribute("checked", "");
  inputElement.addEventListener("change",
      (event) => {
        layers.filter(
            l => l.getProperties().title === event.target.value).forEach(
            l => l.setVisible(!l.getVisible()));
        map.getView().fit(
            layers.filter(
                l => l.getProperties().title
                    === event.target.value)[0].getExtent(), map.getSize());
      });
  let labelElement = document.createElement("label");
  labelElement.appendChild(document.createTextNode(options.image))
  labelElement.setAttribute("for", options.image)
  checkButtons.appendChild(
      inputElement)
  checkButtons.appendChild(labelElement);
  return new ImageLayer({
    visible: true,
    source: new Static({
      url: '/geotiff/' + encodeURI(options.image),
      imageExtent: options.extent,
    }),
    extent: options.extent,
    title: options.image,
    zIndex: zIndex
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

