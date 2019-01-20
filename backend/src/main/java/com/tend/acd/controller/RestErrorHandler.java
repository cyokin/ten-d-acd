package com.tend.acd.controller;

import com.tend.acd.model.response.ResponseBaseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;

/**
 * Module Name: ${FILE_NAME}
 * Project Name: feifanuniv-search-api
 * Created by Cyokin on 5/30/2018
 */
@RestControllerAdvice
public class RestErrorHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ResponseBaseEntity processValidationError(MethodArgumentNotValidException ex) {
        BindingResult result = ex.getBindingResult();
        List<FieldError> fieldErrors = result.getFieldErrors();
        List<String> errorMessage = new ArrayList<>();
        for (FieldError fieldError: fieldErrors) {
            errorMessage.add(fieldError.getField() + ":" + fieldError.getDefaultMessage());
        }
        ResponseBaseEntity output = new ResponseBaseEntity();
        output.code = HttpStatus.BAD_REQUEST.value();
        output.message = String.join(",",errorMessage);
        return output;
    }
}