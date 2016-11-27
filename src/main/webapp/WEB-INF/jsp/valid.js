var columnDefinition = [{
	name: "id field",
	fieldName: "id",
	validation: {
		type: "number",
		message: "숫자만 입력 가능합니다."
	}
},
{
	name: "valid field",
	fieldName: "value",
	validation: {
		type: "string",
		message: "문자열만 입력 가능합니다."
	}
},
{
	name: "etc field",
	fieldName: "etc",
	validation: {
		type: "regExp",
		regExp: "\\w",
		message: "특수문자만 입력 가능합니다."
	}
}];

var data = [{
	id: "111",
	value: "firstValue",
	etc: "#54"
},
{
	id: "222",
	value: "secondValue",
	etc: "@"
}];

var valid = function(colimnInformation, dataList) {
	var checkMap = {};
	
	for (var index in colimnInformation) {
		var item = colimnInformation[index];
		if (item["validation"]) {
			var fieldName = item.fieldName;
			var checkType = item.validation.type;
			var regExp = item.validation["regExp"] ? item.validation["regExp"] : "";
			var falseMessage = item.validation.message;
			
			checkMap[fieldName] = {
					checkType: checkType,
					regExp: regExp,
					falseMessage: falseMessage
			};
		}
	}
	console.log(checkMap);
	
	//check data
	for (var index in dataList) {
		var rowData = dataList[index];
		
		for (var key in checkMap) {
			//console.log(key);
			var checkType = checkMap[key].checkType;
			var falseMessage = checkMap[key].falseMessage;
			
			var targetField = key;
			var targetValue = rowData[key];
			
			var flag = false;
			switch (checkType) {
			case "number":
				var regExp = /\D/g;
				flag = regExp.test(targetValue);
				break;
			case "string":
				var regExp = /[^a-zA-Z]/;
				flag = regExp.test(targetValue);
				break;
			case "upperCase":
				var regExp = /[^A-Z]/;
				flag = regExp.test(targetValue);
				break;
			case "lowerCase":
				var regExp = /[^a-z]/;
				flag = regExp.test(targetValue);
				break;
			case "regExp":
				var regExp = new RegExp(checkMap[key].regExp);
				flag = regExp.test(targetValue);
				break;
			default: 
				// no match type
				break;
			}
			if (flag) {
				alert(targetField + "은(는) " + falseMessage);
				return false;
			}
			// end
		}
	}
};