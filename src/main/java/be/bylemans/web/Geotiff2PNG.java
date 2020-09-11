package be.bylemans.web;

import java.awt.image.RenderedImage;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import javax.imageio.ImageIO;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Produces;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.gce.geotiff.GeoTiffReader;
import org.geotools.util.factory.Hints;
import org.opengis.geometry.Envelope;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@Controller
@RequestMapping("/geotiff")
public class Geotiff2PNG {

  @GetMapping(value = "/{imageName}")
  @Produces(MediaType.IMAGE_PNG_VALUE)
  public void getImageWithName(@PathVariable String imageName, HttpServletResponse response)
      throws IOException {
    try (InputStream in = getClass().getResourceAsStream(
        "/images/" + imageName + ".tif"); ServletOutputStream outputStream = response
        .getOutputStream()) {
      convertToPng(in, outputStream);
    }
  }

  @GetMapping(value = "/{imageName}/metadata")
  @ResponseBody
  @Produces(MediaType.APPLICATION_JSON_VALUE)
  public Map<String, Object> getImageMetadataWithName(@PathVariable String imageName)
      throws IOException {
    Map<String, Object> stringObjectMap = null;
    try (InputStream in = getClass().getResourceAsStream("/images/" + imageName + ".tif")) {
      stringObjectMap = imageMetadata(in);
    }
    return stringObjectMap;
  }

  static void convertToPng(InputStream inputStream, OutputStream outputStream) throws IOException {
    GeoTiffReader reader = new GeoTiffReader(inputStream,
        new Hints(Hints.FORCE_LONGITUDE_FIRST_AXIS_ORDER, Boolean.TRUE));
    GridCoverage2D coverage = reader.read(null);
    RenderedImage image = coverage.getRenderedImage();
    ImageIO.write(image, "PNG", outputStream);
  }

  static Map<String, Object> imageMetadata(InputStream inputStream) throws IOException {
    GeoTiffReader reader = new GeoTiffReader(inputStream,
        new Hints(Hints.FORCE_LONGITUDE_FIRST_AXIS_ORDER, Boolean.TRUE));
    GridCoverage2D coverage = reader.read(null);

    Map<String, Object> result = new HashMap<>();
    Envelope env = coverage.getEnvelope();

    double minX = env.getLowerCorner().getOrdinate(0);
    double minY = env.getLowerCorner().getOrdinate(1);

    double maxX = env.getUpperCorner().getOrdinate(0);
    double maxY = env.getUpperCorner().getOrdinate(1);
    result.put("extent", new double[]{minX, minY, maxX, maxY});
    return result;
  }

}
