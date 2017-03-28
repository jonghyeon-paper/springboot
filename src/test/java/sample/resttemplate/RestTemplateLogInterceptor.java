/*
 * Copyright 2016 NCSOFT.
 * All right reserved.
 *
 * This software is the confidential and proprietary information of NCSOFT.
 * You shall not disclose such Confidential Information and
 * shall use it only in accordance with the terms of the license agreement
 * you entered into with NCSOFT.
*/
package com.ncsoft.bi.core.framework.config;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;

import lombok.extern.slf4j.Slf4j;

/**
 * <pre>
 * com.ncsoft.bi.core.framework.config
 * |_ RestTemplateLogInterceptor.java
 *
 * Describe function of this class (해당구문 삭제 후 comment 기술)
 * </pre>
 *
 * @author jonghyeon
 * @since 2017. 2. 13.
 */
@Slf4j
public class RestTemplateLogInterceptor implements ClientHttpRequestInterceptor {

    /* (non-Javadoc)
     * @see org.springframework.http.client.ClientHttpRequestInterceptor#intercept(org.springframework.http.HttpRequest, byte[], org.springframework.http.client.ClientHttpRequestExecution)
     */
    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
        this.traceRequest(request, body);
        ClientHttpResponse response = execution.execute(request, body);
        this.traceResponse(response);
        return response;
    }

    private void traceRequest(HttpRequest request, byte[] body) throws UnsupportedEncodingException {
        log.info("***************************** request ******************************");
        log.info("URI         : {}", request.getURI());
        log.info("Method      : {}", request.getMethod());
        log.info("Headers     : {}", request.getHeaders() );
        log.info("**********************************************************************");
    }

    private void traceResponse(ClientHttpResponse response) throws IOException {
        log.info("***************************** response *****************************");
        log.info("Status code  : {}", response.getStatusCode());
        log.info("Status text  : {}", response.getStatusText());
        log.info("Headers      : {}", response.getHeaders());
        log.info("**********************************************************************");
    }

}
