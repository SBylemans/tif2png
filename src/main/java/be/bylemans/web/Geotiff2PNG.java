package be.bylemans.web;

import java.awt.Color;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
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

@Controller
@RequestMapping("/geotiff")
public class Geotiff2PNG {

  private static final Color backColor = new Color(255, 255, 255);
  private static final int THRESHOLD = 35;
  private static final int TRANSPARENT = 0;  // 0x00000000;

  @GetMapping(value = "/{imageName}")
  @ResponseBody
  @Produces(MediaType.IMAGE_PNG_VALUE)
  public void getImageWithName(@PathVariable String imageName, HttpServletResponse response)
      throws IOException {
    try (InputStream in = getClass().getResourceAsStream(
        "/images/" + imageName + ".tif"); ServletOutputStream outputStream = response
        .getOutputStream()) {
      convertToWhiteTransparentPng(imageName, in, outputStream);
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

  void convertToWhiteTransparentPng(String imageName, InputStream inputStream,
      OutputStream outputStream)
      throws IOException {
//    Alternative method (not working for all tif's)
//    GeoTiffReader reader = new GeoTiffReader(inputStream);
//    ParameterValue<Color> input = AbstractGridFormat.INPUT_TRANSPARENT_COLOR.createValue();
//    input.setValue(Color.white);
//    GridCoverage2D coverage = reader.read(new GeneralParameterValue[]{input});

    BufferedImage image = ImageIO.read(inputStream);

    // Buffered image met alpha channel
    BufferedImage newImage = new BufferedImage(image.getWidth(), image.getHeight(),
        BufferedImage.TYPE_4BYTE_ABGR);

    int height = image.getHeight();
    int width = image.getWidth();

    Graphics g = image.getGraphics();
    g.drawImage(image, 0, 0, null);

    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        int pixel = image.getRGB(x, y);
        Color color = new Color(pixel);

        int dr = Math.abs(color.getRed() - backColor.getRed()),
            dg = Math.abs(color.getGreen() - backColor.getGreen()),
            db = Math.abs(color.getBlue() - backColor.getBlue());

        if (dr < THRESHOLD && dg < THRESHOLD && db < THRESHOLD) {
          newImage.setRGB(x, y, TRANSPARENT);
        } else {
          newImage.setRGB(x, y, pixel);
        }
      }
    }
//    File compressedImageFile = new File("compressed_image_" + imageName + ".jpg");
//    OutputStream os = new FileOutputStream(compressedImageFile);
//
//    Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
//    ImageWriter writer = (ImageWriter) writers.next();
//
//    ImageOutputStream ios = ImageIO.createImageOutputStream(os);
//    writer.setOutput(ios);
//
//    ImageWriteParam param = writer.getDefaultWriteParam();
//
//    param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
//    param.setCompressionQuality(0.05f);  // Change the quality value you prefer
//    writer.write(null, new IIOImage(image, null, null), param);
//
//    os.close();
//    ios.close();
//    writer.dispose();

    ImageIO.write(newImage, "PNG", outputStream);
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