package com.tend.acd.server.controller;

import LinkFuture.DB.Utility;
import com.tend.acd.server.model.response.ConfigEntity;
import com.tend.acd.server.service.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by Cyokin
 * on 3/25/2016.
 */
@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/content")
public class ContentController {

    @Autowired
    ConfigEntity configEntity;

    @Autowired
    SecurityService securityService;

    @Cacheable("tendConfig")
    @GetMapping(value = "/config.js",produces="text/javascript")
    public @ResponseBody String getConfig(String input, HttpServletResponse response)
            throws Exception {
        return "window.tendConfig=" + Utility.toJson(configEntity);
    }

    @GetMapping(value = "/certificate/{id}", produces="application/zip")
    public void downloadCertificate(@PathVariable String id, HttpServletResponse response, HttpServletRequest request)
            throws Exception {
        response.setHeader("Content-Disposition", "attachment; filename=\"hospital.cert\"");
        securityService.generateCertificate(id,response.getOutputStream());
    }

}
