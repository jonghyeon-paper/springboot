package kr.co.springboot.persistence.hibernate;

import org.springframework.data.repository.CrudRepository;

import kr.co.springboot.model.hibernate.User;

public interface UserRepository extends CrudRepository<User, String> {

}
