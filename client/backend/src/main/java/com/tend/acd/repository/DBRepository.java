package com.tend.acd.repository;

import LinkFuture.DB.DBHelper.GenericDBHelper;
import com.tend.acd.Util;
import com.tend.acd.model.response.ConfigEntity;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.util.UUID;

@Repository
public class DBRepository {

    @Autowired
    ConfigEntity configEntity;

    @Autowired
    GenericDBHelper dbHelper;

    public Boolean saveHistory(JSONObject input) throws Exception {
        File img = Util.saveBase64Image(input.getString("original_image_src"));
        input.put("original_image",Util.stripExtension(img.getName()));
        img = Util.saveBase64Image(input.getString("roi_image_src"));
        input.put("roi_image",Util.stripExtension(img.getName()));
        input.put("ai_version",configEntity.recognitionVersion);
        Object id = dbHelper.insert("roi_history",input);
        Util.logger.trace("save history success," + id);
        return true;
    }

    public JSONArray getOriImages(JSONObject input) throws Exception {
        JSONObject results = dbHelper.selectToJson("v_roi_image",input);
        return results.has("data")?results.getJSONArray("data"):null;
    }
    public Boolean save(JSONObject input) throws Exception {
        JSONArray originalImageList =  input.getJSONArray("original_image");
        JSONArray oriImage = input.getJSONArray("roi_image");
        Object id = dbHelper.insert("record",input);
        Util.logger.trace("save record success," + id);
        for(int i=0;i<originalImageList.length();i++)
        {
            JSONObject item = originalImageList.getJSONObject(i);
            File img = Util.saveBase64Image(item.getString("src"));
            item.put("new_id",Util.stripExtension(img.getName()));
        }
        for(int i=0;i<oriImage.length();i++)
        {
            JSONObject item = oriImage.getJSONObject(i);
            File img = Util.saveBase64Image(item.getString("src"));
            item.put("ai_version",configEntity.recognitionVersion);
            item.put("record_id",id.toString());
            item.put("roi_image",Util.stripExtension(img.getName()));
            item.put("original_image",findNewId(originalImageList,item.getString("original_image_id")));
            Object roiImageId = dbHelper.insert("roi_image",item);
            Util.logger.trace("save roi image success," + roiImageId);
        }
        Util.logger.trace("save all success," + id);
        return true;
    }
    private String findNewId(JSONArray originalImageList,String oldId){
        for(int i=0;i<originalImageList.length();i++)
        {
            JSONObject item = originalImageList.getJSONObject(i);
            if(item.getString("id").equalsIgnoreCase(oldId))
            {
                return item.getString("new_id");
            }
        }
        return null;
    }

    public JSONObject findHospital(UUID hospitalId) throws Exception {
        JSONObject query = new JSONObject();
        JSONObject where = new JSONObject();
        where.put("hospital_id",hospitalId.toString());
        query.put("$where",where);
        return dbHelper.selectOneToJson("hospital",query);
    }
}
