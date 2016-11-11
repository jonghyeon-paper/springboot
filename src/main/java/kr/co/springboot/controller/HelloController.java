package kr.co.springboot.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;

import kr.co.springboot.hibernate.model.User;
import kr.co.springboot.service.HelloService;

@Controller
public class HelloController {
	
	@Autowired
	HelloService helloService;
	
	@RequestMapping(value = "/greeting")
	public String greeting(Model model) {
		
		List<?> userList = helloService.getUserList();
		model.addAttribute("userList", userList);
		
		return "greeting";
	}
	
	public Map<String, Object> addUser(Model model,
			@ModelAttribute User user) {
		
		//helloService.
		
		return null;
		
	}
}
