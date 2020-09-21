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
   "33495911-8c52-407c-bcfb-d081501903ea",
  "9e7c620c-799e-4753-a8ab-56a49ae8f607",
  "b074a056-8acc-41d3-a6b0-72501863c38e",
  "5ea4b416-bfe3-492b-b6c0-a8fc1039f38d",
  // "14374eba-af0c-4fbe-9d51-a178a3a88fec", // grootste
  // "3bc3f262-513e-4bc0-b162-ed081d4cb348", // not found
  // "dfdafb8e-b4d3-402b-ba5a-ddf83fbd3f48",
  // "501cc5ac-2815-44f7-9ad8-c8ff3103a9fe",
  // "92301e9f-d5bb-4244-8da4-bcc13ed46fc9",
  // "bbdbe0ef-e186-4340-b95e-4d22d5f4a5ab",
  // "b0eb0168-66e4-4099-b5b4-5cae9536a707",
  // "ccda8c14-490e-4dd1-b137-7f16554848c7",
  // "2f1345f0-7d4a-4cb1-8a49-87e619b6ccad",
  // "3feb0b99-a58b-43e5-944b-53fdaf492750",
  // "868ca187-0d87-4073-9e58-80471a222525",
  // "2b3632eb-68b5-4140-b0cd-6fb7fd52102d",
  // "14f5dab5-5f05-43fe-a52e-45f7f645794e",
  // "b01627a5-002e-4857-9382-bd1d27379645",
  // "118dd21e-dfe3-4b04-b098-5a1a9513c833",
  // "5a4579d7-0741-4ef5-acad-0136f6427b36",
  // "8ee82a6b-5327-4098-9af6-3b6aec53cba1",
  // "9821672a-0c16-482c-9513-29151cc0fb97",
  // "fffc88f3-44b0-431c-9b51-683910fc84f9",
  // "81a5333f-27c7-4e10-a337-c82d99f6bf6b",
  // "f1ac6ad6-0a31-4b24-8451-9ef764682632",
  // "94c62b15-6b98-4e1c-81c3-93107aa446f1",
  // "8965beb3-09fb-4138-bf86-17e0f30a88a5",
  // "0c8720e5-5541-40bb-b4b8-258df21d3279",
  // "f53e9e41-f980-43b9-bec8-6625f54d80e8",
  // "65dced48-2a75-4168-b031-f7ce80267f12",
  // "b16084b3-fe4d-4fca-9b63-67e23d52cdf6",
  // "46bc8452-878a-4586-b834-b0f09fb6b66b",
  // "c3730895-442f-4d22-8d17-c8141cf21efd",
  // "440b400c-62e6-4273-b475-7886021c23b0",
  // "cddb9289-26c1-405e-8bb8-09ff430ade9d",
  // "23794880-6232-4c43-8cbc-7dca7e0efb2e",
  // "6716201e-b466-4033-aeed-ebea50325229",
  // "397d52f5-e25b-4178-a809-c31bf8ce1b1b",
  // "a0c3841a-f7d1-40b3-8ac6-5766be398250",
  // "0b04e560-20d3-4630-b063-b5bb27613755",
  // "71d5fa11-4fe5-4da7-a94d-cb7c26e5f1ad",
  // "ab50041c-4840-4527-8ac8-3515f0070091",
  // "b0f18117-be0e-4b0b-ab81-105bf16012c7",
  "ce7b364d-96cb-41ca-b99d-790f5bba75bc",
  // "08d17d3a-8f84-40c5-81e9-8a1b5aa88c33",
  // "051fc5da-3b8c-45a0-8203-31bb6c913d9b",
  // "82fa58ca-5c8e-4a3d-a09b-a7fa4b6c73d3",
  // "44d11b65-9536-4785-b271-b05c2127a387",
  // "117ca31d-7bef-48fa-991f-8e241f7d4251",
  // "f527da63-f178-4c35-9098-193636b4e824",
]
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
        images.map(
            imageName => fetch(
                "http://dsi-ontwikkel.omgeving.vlaanderen.be/api/fiches/stukken/"
                + encodeURI(imageName) + "/extent",
                {headers: headers})))).then(
    response => {
      Promise.all([response[0].text()].concat(
          response.slice(1).map(jsonResponse => jsonResponse.json()))).then(
          textAndJson => {

            console.dir(textAndJson);
            var text = textAndJson[0];
            var json = textAndJson.slice(1);
            wmtsCapabilities = parser.read(text);

            var layer1 = _createTileLayer(
                _loadWMTSOptions(wmtsCapabilities, "grb_bsk_grijs", "BPL72VL"),
                0);

            let imagesWithMetadata = json.map((j, i) => {
              return {extent: [j.minX, j.minY, j.maxX, j.maxY], image: images[i]};
            });
            imagesWithMetadata = imagesWithMetadata.sort((a, b) => {
              return areaCompareExtent(a.extent, b.extent);
            })

            layers = [layer1].concat(imagesWithMetadata.map((im, i) =>
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
                l => l.getProperties().title === event.target.value)[0].getExtent(), map.getSize());
      });
  let labelElement = document.createElement("label");
  labelElement.appendChild(document.createTextNode(options.image))
  labelElement.setAttribute("for", options.image)
  checkButtons.appendChild(inputElement)
  checkButtons.appendChild(labelElement);
  return new ImageLayer({
    visible: true,
    source: new Static({
      url: 'http://dsi-ontwikkel.omgeving.vlaanderen.be/api/fiches/stukken/'
          + encodeURI(options.image) + '/png',
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
