package kr.co.springboot.model.hibernate;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity(name = "ARTICLES")
public class Article {
	
	@Id
	@GeneratedValue(strategy =  GenerationType.AUTO)
	private Integer articleKey;
	
	private String title;
	
	private String content;
	
	private String username;
	
	private String createDate;
	
	private String modifyDate;

	public Integer getArticleKey() {
		return articleKey;
	}

	public void setArticleKey(Integer articleKey) {
		this.articleKey = articleKey;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getCreateDate() {
		return createDate;
	}

	public void setCreateDate(String createDate) {
		this.createDate = createDate;
	}

	public String getModifyDate() {
		return modifyDate;
	}

	public void setModifyDate(String modifyDate) {
		this.modifyDate = modifyDate;
	}

}
