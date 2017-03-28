package springboot;

import java.net.URI;

import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

public class restTemplateSample {

	public static void main(String[] argus) {
		
		HttpComponentsClientHttpRequestFactory httprequestFactory = new HttpComponentsClientHttpRequestFactory();
		
		RestTemplate restTemplate = new RestTemplate(httprequestFactory);
		
		URI uri = URI.create("http://dev-nextbi.ncsoft.com/nextbi-static-ui/html/data.json");
		String response = restTemplate.getForObject(uri, String.class);
		
		System.out.println(response);
	}
}
