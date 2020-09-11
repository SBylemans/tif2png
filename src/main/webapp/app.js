
import ImageLayer from 'ol/layer/Image';
import Map from 'ol/Map';
import Projection from 'ol/proj/Projection';
import Static from 'ol/source/ImageStatic';
import View from 'ol/View';
import {getCenter} from 'ol/extent';

// Map views always need a projection.  Here we just want to map image
// coordinates directly to map coordinates, so we create a projection that uses
// the image extent in pixels.
    var extent = [0, 0, 1024, 968];
    var projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: extent,
    });

    var map = new Map({
      layers: [
        new ImageLayer({
          source: new Static({
            url: '/test',
            projection: projection,
            imageExtent: extent,
          }),
        }) ],
      target: 'map',
      view: new View({
        projection: projection,
        center: getCenter(extent),
        zoom: 2,
        maxZoom: 8,
      }),
    });
