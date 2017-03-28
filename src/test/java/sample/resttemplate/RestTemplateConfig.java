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

import java.util.ArrayList;
import java.util.List;

import org.apache.http.client.config.RequestConfig;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * <pre>
 * com.ncsoft.bi.core.framework.config
 * |_ RestTemplateConfig.java
 *
 * Describe function of this class (해당구문 삭제 후 comment 기술)
 * </pre>
 *
 * @author jonghyeon
 * @since 2017. 2. 7.
 */
@Configuration
public class RestTemplateConfig {

    private static final int CONNECTION_REQUEST_TIMEOUT = 1000 * 5;
    private static final int CONNECTION_TIMEOUT = 1000 * 5;
    private static final int SOCKET_TIMEOUT = 1000 * 5;

    private static final int MAX_TOTAL_CONNECTIONS = 100;

    /**
     * <pre>
     * Describe function of this method. -> 해당 구문 삭제 후 comments 기술
     * </pre>
     *
     * @return
     */
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate(this.bufferHttpRequestFactory());
        this.setCustomInterceptor(restTemplate);
        return restTemplate;
    }

    /**
     * <pre>
     * Describe function of this method. -> 해당 구문 삭제 후 comments 기술
     * </pre>
     *
     * @return
     */
    public BufferingClientHttpRequestFactory bufferHttpRequestFactory() {
        return new BufferingClientHttpRequestFactory(this.httpRequestFactory());
    }

    /**
     * <pre>
     * Describe function of this method. -> 해당 구문 삭제 후 comments 기술
     * </pre>
     *
     * @return
     */
    public ClientHttpRequestFactory httpRequestFactory() {
        HttpComponentsClientHttpRequestFactory httpComponentsClientHttpRequestFactory = new HttpComponentsClientHttpRequestFactory();
        httpComponentsClientHttpRequestFactory.setHttpClient(this.httpClient());
        return httpComponentsClientHttpRequestFactory;
    }

    /**
     * <pre>
     * Describe function of this method. -> 해당 구문 삭제 후 comments 기술
     * </pre>
     *
     * @return
     */
    public CloseableHttpClient httpClient() {
        return HttpClientBuilder.create()
                .setConnectionManager(this.connectionManager())
                .setDefaultRequestConfig(this.requestConfig())
                .build();
      }

    /**
     * <pre>
     * Describe function of this method. -> 해당 구문 삭제 후 comments 기술
     * </pre>
     *
     * @return
     */
    public PoolingHttpClientConnectionManager connectionManager() {
        PoolingHttpClientConnectionManager poolingHttpClientConnectionManager = new PoolingHttpClientConnectionManager();
        poolingHttpClientConnectionManager.setMaxTotal(MAX_TOTAL_CONNECTIONS);
        return poolingHttpClientConnectionManager;
    }

    /**
     * <pre>
     * Describe function of this method. -> 해당 구문 삭제 후 comments 기술
     * </pre>
     *
     * @return
     */
    public RequestConfig requestConfig() {
        return RequestConfig.custom()
                .setConnectionRequestTimeout(CONNECTION_REQUEST_TIMEOUT)
                .setConnectTimeout(CONNECTION_TIMEOUT)
                .setSocketTimeout(SOCKET_TIMEOUT)
                .build();
    }

    /**
     * <pre>
     * Describe function of this method. -> 해당 구문 삭제 후 comments 기술
     * </pre>
     *
     * @param restTemplate
     */
    public void setCustomInterceptor(RestTemplate restTemplate) {
        List<ClientHttpRequestInterceptor> interceptors = new ArrayList<>();
        interceptors.add(new RestTemplateLogInterceptor());
        restTemplate.setInterceptors(interceptors);
    }

}
