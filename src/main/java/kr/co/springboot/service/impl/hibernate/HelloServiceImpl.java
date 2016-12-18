package kr.co.springboot.service.impl.hibernate;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.springboot.model.hibernate.User;
import kr.co.springboot.persistence.hibernate.UserRepository;
import kr.co.springboot.service.HelloService;

@Service
public class HelloServiceImpl implements HelloService {
	
	@Autowired
	private HibernateTemplate hibernateTemplete;
	
	@Autowired
	private UserRepository userRepository;
	
	@Override
	public List<User> getUserList() {
//		List<Member> userList = hibernateTemplete.loadAll(Member.class);
		List<User> memberList = (List<User>) userRepository.findAll();
		System.out.println("memberList > " + memberList.size());
		for (User member : memberList) {
			System.out.println(member.toString());
		}
		
		return memberList;
	}

	@Override
	@Transactional
	public Map<String, Object> addUser(User member) {
		
		member = new User("AAA", "BBB", true);
		userRepository.save(member);
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
