package be.bylemans.web;

import java.awt.image.RenderedImage;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Produces;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.gce.geotiff.GeoTiffReader;
import org.geotools.util.factory.Hints;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController("/geotiff")
public class Geotiff2PNG {

  @GetMapping(value = "/{imageName}")
  @Produces(MediaType.IMAGE_PNG_VALUE)
  public void getImageWithName(@PathVariable String imageName, HttpServletResponse response)
      throws IOException {
    InputStream in = getClass().getResourceAsStream("/images/" + imageName + ".tif");
    convertToPng(in, response.getOutputStream());
  }

  static void convertToPng(InputStream inputStream, OutputStream outputStream) throws IOException {
    GeoTiffReader reader = new GeoTiffReader(inputStream,
        new Hints(Hints.FORCE_LONGITUDE_FIRST_AXIS_ORDER, Boolean.TRUE));
    GridCoverage2D coverage = reader.read(null);
    RenderedImage image = coverage.getRenderedImage();
    ImageIO.write(image, "PNG", outputStream);
  }

}
