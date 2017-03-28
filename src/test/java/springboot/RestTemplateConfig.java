package springboot;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate(getHttpComponentsClientHttpRequestFactory());
	}
	
	private HttpComponentsClientHttpRequestFactory getHttpComponentsClientHttpRequestFactory() {
		HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
		requestFactory.setConnectTimeout(1000 * 10);
		requestFactory.setReadTimeout(1000 * 10);
		return requestFactory;
	}
	
}
