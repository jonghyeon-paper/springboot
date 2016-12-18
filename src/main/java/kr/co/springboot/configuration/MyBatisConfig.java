package kr.co.springboot.configuration;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.mapper.MapperScannerConfigurer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;

//@Configuration
public class MyBatisConfig {
	
	@Autowired
	private ApplicationContext applicationContext;
	
	@Bean
	public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
		SqlSessionFactoryBean sessionFactoryBean = new SqlSessionFactoryBean();
		sessionFactoryBean.setDataSource(dataSource);
		//sessionFactoryBean.setTypeAliasesPackage("");
		//sessionFactoryBean.setConfigLocation(applicationContext.getResource(""));
		//sessionFactoryBean.setMapperLocations(applicationContext.getResources(""));
		sessionFactoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:persistence/*.xml"));
		sessionFactoryBean.setConfiguration(configuration());
		return sessionFactoryBean.getObject();
		
	}
	
	@Bean
	public DataSourceTransactionManager transactionManager(DataSource dataSource) {
		DataSourceTransactionManager transactionManager = new DataSourceTransactionManager();
		transactionManager.setDataSource(dataSource);
		//transactionManager.setGlobalRollbackOnParticipationFailure(false);
		return transactionManager;
	}
	
	@Bean
	public MapperScannerConfigurer mapperScannerConfigurer() {
		MapperScannerConfigurer configurer = new MapperScannerConfigurer();
		configurer.setBasePackage("kr.co.springboot.persistence.mybatis");
		return configurer;
	}
	
	public org.apache.ibatis.session.Configuration configuration() {
		org.apache.ibatis.session.Configuration mybaatisConfiguration = new org.apache.ibatis.session.Configuration();
		mybaatisConfiguration.setMapUnderscoreToCamelCase(true);
		return mybaatisConfiguration;
	}
}
