package kr.co.springboot.configuration;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabase;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType;

import net.sf.log4jdbc.Log4jdbcProxyDataSource;
import net.sf.log4jdbc.tools.Log4JdbcCustomFormatter;
import net.sf.log4jdbc.tools.LoggingType;

@Configuration
public class DataSourceConfig {
	
	@Bean
	public DataSource dataSource() {
		EmbeddedDatabaseBuilder builder = new EmbeddedDatabaseBuilder();
		EmbeddedDatabase db = builder.setType(EmbeddedDatabaseType.HSQL)
				.addScript("classpath:hsqlDB/schema.sql")
				.addScript("classpath:hsqlDB/data.sql")
				.build();
		return db;
	}

	@Bean
	public Log4jdbcProxyDataSource dataSourceLog(DataSource dataSource) {
		Log4JdbcCustomFormatter logFormatter = new Log4JdbcCustomFormatter();
		logFormatter.setLoggingType(LoggingType.MULTI_LINE);
		logFormatter.setSqlPrefix("SQL  :: ");
		
		Log4jdbcProxyDataSource querylog = new Log4jdbcProxyDataSource(dataSource);
		querylog.setLogFormatter(logFormatter);
		
		return querylog;
	}
}
