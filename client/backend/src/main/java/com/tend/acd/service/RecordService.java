package com.tend.acd.service;

import com.tend.acd.Util;
import com.tend.acd.repository.DBRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.StringWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Module Name: ImageRecognitionService Project Name: com.tend.acd Created by Cyokin on 1/18/2019
 */
@SuppressWarnings("Duplicates")
@Service
public class RecordService {

  @Autowired
  DBRepository dbRepository;

  public Boolean save(JSONObject input) throws Exception {
    return dbRepository.save(input);
  }

  public void download(JSONObject input, HttpServletResponse response) throws Exception {
    response.setHeader("Content-Disposition", "attachment; filename=\"tend-d-acd.zip\"");
    JSONArray oriImage = dbRepository.getOriImages(input);
    if(oriImage != null && oriImage.length()>0 )
    {
      oriImage = oriImage.getJSONArray(0);
      StringWriter sw = new StringWriter();
      HashSet<String> entryExists = new HashSet<>();
      try(ZipOutputStream zos = new ZipOutputStream(response.getOutputStream())) {
        try(CSVPrinter csvPrinter = new CSVPrinter(sw, CSVFormat.DEFAULT
                .withHeader("ID","External ID", "ORIGINAL Image ID", "ROI Image ID", "Prediction", "Pathology", "Probability","Processing Time","Cancer Type","Machine Type","Coordinate","Date Registered")))
        {
          for(int i=0;i<oriImage.length();i++)
          {
            JSONObject item = oriImage.getJSONObject(i);
            String imageId = item.get("roi_image").toString();
            String imageName = imageId + ".png";
            String outputImageName = buildImageNameInZip(item);
            if(!entryExists.contains(outputImageName))
            {
              putImageToZip(zos,imageName,"roi/" + outputImageName);
              entryExists.add(outputImageName);
            }

            String originalImageId = item.get("original_image").toString();
            String originalImageName = originalImageId + ".png";
            if(!entryExists.contains(originalImageName)) {
              putImageToZip(zos, originalImageName, "original/" + originalImageName);
              entryExists.add(originalImageName);
            }

            csvPrinter.printRecord(
                    item.get("roi_image_id").toString()
                    ,item.get("record_external_id").toString()
                    ,item.get("original_image").toString()
                    ,item.get("roi_image").toString()
                    ,item.has("prediction")?item.getString("prediction"):null
                    ,item.has("pathology")?item.getString("pathology"):null
                    ,item.has("probability")?item.getDouble("probability"):null
                    ,item.has("processing_time")?item.getDouble("processing_time"):null
                    ,item.has("cancer_type_name")?item.getString("cancer_type_name"):null
                    ,item.has("machine_type_name")?item.getString("machine_type_name"):null
                    ,item.has("coordinate")?item.get("coordinate").toString():null
                    ,item.has("date_registered")?item.getString("date_registered"):null
            );
          }
          ZipEntry entry = new ZipEntry("record.csv");
          zos.putNextEntry(entry);
          zos.write(sw.toString().getBytes());
          zos.closeEntry();
        }
      }
    }
    else
    {
      response.sendError(404,"No results found");
    }
  }
  private void putImageToZip(ZipOutputStream zos,String imageName,String zipImageName) throws IOException {
    Path originalFilePath = Util.getFilePath(imageName);
    if(Files.exists(originalFilePath))
    {
      ZipEntry entry = new ZipEntry(zipImageName);
      zos.putNextEntry(entry);
      zos.write(Files.readAllBytes(originalFilePath));
      zos.closeEntry();
    }
  }

  private String buildImageNameInZip(JSONObject item){
    return Util.fileNameFormat(
            item.getString("cancer_type_name")
    + "_"  + item.getString("machine_type_name")
    + "_"  + (item.has("pathology")?item.getString("pathology"):"")
    + "_"  + item.getString("prediction")
    //+ "_"  + (item.has("probability")?item.getDouble("probability"):"")
    //+ "_"  + (item.has("processing_time")?item.getDouble("processing_time"):"")
    + "_"  + item.get("roi_image").toString() + ".png");
  }

}
