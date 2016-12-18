package kr.co.springboot.service.impl.hibernate;

import java.text.DecimalFormat;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
//		List<User> memberList = (List<User>) userRepository.findByUsernameContainingOrderByUsername("AAA");
//		System.out.println("memberList > " + memberList.size());
//		for (User member : memberList) {
//			System.out.println(member.toString());
//		}
		
		Page<User> memberList = (Page<User>) userRepository.findByUsernameContainingOrderByUsername("AAA", new PageRequest(0, 7, new Sort(Sort.Direction.ASC, "username")));
		System.out.println(memberList.toString());
		
		return memberList.getContent();
	}

	@Override
	@Transactional
	public Map<String, Object> addUser(User member) {
		DecimalFormat df = new DecimalFormat("00");
		for (int i=0; i<20; i++) {
			member = new User("AAA" + df.format(i), "BBB" + df.format(i), true);
			userRepository.save(member);
		}
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
