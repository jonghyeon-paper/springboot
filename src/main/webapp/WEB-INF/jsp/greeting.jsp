<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>Insert title here</title>
</head>
<body>
	hello~~
	<br>
	<c:forEach var="item" items="${userList}" varStatus="status">
		<c:out value="${item.username}"/> / <c:out value="${item.password}"/> / <c:out value="${item.enabled}"/> <br>
	</c:forEach>
</body>
</html>