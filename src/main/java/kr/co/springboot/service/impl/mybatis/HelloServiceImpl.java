package kr.co.springboot.service.impl.mybatis;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.springboot.hibernate.model.User;
import kr.co.springboot.persistence.HelloMapper;
import kr.co.springboot.service.HelloService;

//@Service
public class HelloServiceImpl implements HelloService {
	
//	@Autowired
//	private HelloMapper helloMapper;
	
	@Override
	public List<Map<String, Object>> getUserList() {
		
		List<Map<String, Object>> userList = new ArrayList<Map<String, Object>>();
//		userList = helloMapper.selectUserList();
		for (Map<String, Object> user : userList) {
			System.out.println(user.toString());
		}
		
		return userList;
	}

	@Override
	public Map<String, Object> addUser(User user) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Map<String, Object> updateUser(User user) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Map<String, Object> deleteUser(User user) {
		// TODO Auto-generated method stub
		return null;
	}
}
