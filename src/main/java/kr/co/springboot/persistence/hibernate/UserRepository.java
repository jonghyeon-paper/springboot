package kr.co.springboot.persistence.hibernate;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

import kr.co.springboot.model.hibernate.User;

public interface UserRepository extends PagingAndSortingRepository<User, String> {
	
	List<User> findByUsernameContainingOrderByUsername(String name);
	
	Page<User> findByUsernameContainingOrderByUsername(String name, Pageable pageable);
	
}
