package kr.co.springboot.service.impl.hibernate;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.springboot.hibernate.model.User;
import kr.co.springboot.service.HelloService;

@Service
public class HelloServiceImpl implements HelloService {
	
	@Autowired
	private HibernateTemplate hibernateTemplete;
	
	@Override
	@Transactional
	public List<User> getUserList() {
		
		List<User> userList = hibernateTemplete.loadAll(User.class);
		for (User user : userList) {
			System.out.println(user.toString());
		}
		
		return userList;
	}

	@Override
	@Transactional
	public Map<String, Object> addUser(User user) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	@Transactional
	public Map<String, Object> updateUser(User user) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	@Transactional
	public Map<String, Object> deleteUser(User user) {
		// TODO Auto-generated method stub
		return null;
	}
}
