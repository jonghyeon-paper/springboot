package kr.co.springboot.persistence;

import java.util.List;
import java.util.Map;

public interface HelloMapper {

	public List<Map<String, Object>> selectUserList();
}
