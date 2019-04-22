package com.tend.acd.server;

import com.tend.acd.server.model.request.UserEntity;
import com.tend.acd.server.repository.JwtRepository;
import com.tend.acd.server.security.SecurityFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;

@SpringBootApplication
@EnableCaching
@SuppressWarnings("Duplicates")
public class Application {

    @Value("${postgreSQL.connection}")
    String DBConnectionString;

    @Autowired
    JwtRepository jwtRepository;

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        app.run(args);
    }

    @Bean
    ServletRegistrationBean getServletRegistration() {
        ServletRegistrationBean srb = new ServletRegistrationBean();
        srb.setServlet(new LinkFuture.DB.Servlet.GenericDBServlet());
        srb.setUrlMappings(Collections.singletonList("/api/db/*"));
        HashMap<String, String> initParameters = new HashMap<>();
        initParameters.put("DBConnectionString", DBConnectionString);
        Util.logger.trace("init DB connection =>" + DBConnectionString);
        srb.setInitParameters(initParameters);
        return srb;
    }

//    @Bean
//    public FilterRegistrationBean filterRegistration() {
//        FilterRegistrationBean registration = new FilterRegistrationBean();
//        registration.setFilter(new SecurityFilter(jwtRepository));
//        registration.addUrlPatterns("/api/*");
//        return registration;
//    }
}