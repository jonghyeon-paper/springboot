package kr.co.springboot.service;

import java.util.List;
import java.util.Map;

import kr.co.springboot.hibernate.model.User;

public interface HelloService {

	List<?> getUserList();
	
	Map<String, Object> addUser(User user);
	
	Map<String, Object> updateUser(User user);
	
	Map<String, Object> deleteUser(User user);
}
