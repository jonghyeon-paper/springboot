function makeRealGridFieldAndColumn(gridView, fieldInfo){
	var fields = [];
	var columns = [];
	
	var fieldLength = fieldInfo.length;
	for (var i = 0; i < fieldLength; i++) {
		var fieldName     = fieldInfo[i].fieldName;
		var fieldType     = fieldInfo[i].fieldType;
		var editable      = fieldInfo[i].editable;
		var type          = fieldInfo[i].type;
		var visible       = fieldInfo[i].visible;
		var width         = fieldInfo[i].width;
		var text          = fieldInfo[i].text;
		var status        = fieldInfo[i].status;
		var subColumns    = fieldInfo[i].subColumns;
		var align         = fieldInfo[i].align;
		var dynamicStyles = fieldInfo[i].dynamicStyles;
		var defaultValue  = fieldInfo[i].defaultValue;
		
		var field = {};
		var column = {};
		// set field information
		field = {
				fieldName: fieldName,
				dataType: fieldType
		};
		
		// set column information
		column['name'] = fieldName;
		column['fieldName'] = fieldName;
		
		if (width) {
			column['width'] = width;
		}
		
		if (defaultValue) {
			column['defaultValue'] = defaultValue;
		}
		
		if (editable !== null && editable !== undefined && editable !== '') {
			column['editable'] = editable;
		}
		
		if (visible !== null && visible !== undefined && visible !== '') {
			column['visible'] = visible;
		}
		
		column['header'] = {
				text: text
		};
		
		if (type) {
			// type이 있는경우
			if (type["element"] === "line") {
				column['editor'] = {
						type: 'line',
						maxLength: (type['maxLength'] ? type['maxLength'] : 0),          // 최대입력길이. 0이면 무한.
						textCase: (type['textCase'] ? type['textCase'] : 'default')      // 대소문자 변환. default가 기본값.
				};
			} else if (type["element"] === "number") {
				column['editor'] = {
						type: 'number',
						positiveOnly: true    // 양수값만 가능.
				};
			} else if (type["element"] === "date") {
				column['editor'] = {
						type: 'date',
						datetimeFormat: type["format"]
				};
			} else if (type['element'] === "dropDown") {
				column['editor'] = {
						type: 'dropDown',
						domainOnly: true,        // 목록에 있는 값들만 지정할 수 있게
						textReadOnly: true,      // true이면 키보드로 입력이 안되고 선택만 가능하게 된다.
						dropDownWhenClick: true,
				};
				column['labels'] = [type["labels"]];
				column['values'] = [type["values"]];
				column['lookupDisplay'] = true;
			} else if (type["element"] === "popup") {
				column['button'] = 'action';
			} else if (type["element"] === "button") {
				column['button'] = 'action';
			} else if (type["element"] === "checkbox") {
				column['renderer'] = {
						type: 'check',
						editable: true,
						startEditOnClick: true,
						trueValues: type["trueValue"],
						falseValues: type["falseValue"]
				};
				column['dynamicStyles'] = [{
					criteria: 'value = "' + type["trueValue"] + '"'
				}];
			} else if (type["element"] === "img") {
				column['renderer'] = {
						type: 'icon'
				};
				column['imageList'] = 'modalImage';
				column['styles'] = {
						iconIndex: 0,
						textAlignment: 'near',
						iconLocation: 'right',
						iconAlignment: 'center',
						iconPadding: 100
				};
				if (status === "required") {
					column['styles']['background'] = '#fff9cd';
				} else if (status === "disabled") {
					column['styles']['background'] = '#f6f6f6';
				}
			} else if (type["element"] === "drillDown") {
				column['renderer'] = {
						type: 'icon'
				};
				column['imageList'] = 'modalImage';
				column['styles'] = {
						iconIndex: 0,
						iconLocation: 'center',
						iconAlignment: 'center',
						iconPadding: 100
				};
				if (status === 'required') {
					column['styles']['background'] = '#fff9cd';
				} else if (status === "disabled") {
					column['styles']['background'] = '#f6f6f6';
				}
			}
			
			// set styles
			// 스타일은 타입이 img와 drillDown이 아닌 경우만 설정한다.
			// 타입이 img와 drillDown인 경우에는 내부적으로 스타일을 지정하기 때문이다.
			if (type['element'] !== 'img' && type['element'] !== 'drillDown') {
				// 배경색 지정
				if (status === 'required') {
					column['styles'] = {
							background: '#fff9cd'
					};
				} else if (status === 'disabled') {
					column['styles'] = {
							background: '#f6f6f6'
					};
				}
				
				// 정렬 지정
				if (align) {
					column['styles']['textAlignment'] = align;
				} else {
					if (fieldType === 'text') {
						column['styles']['textAlignment'] = 'center';
					} else if (fieldType === 'number') {
						column['styles']['textAlignment'] = 'far';
					} else {
						column['styles']['textAlignment'] = 'near';
					}
				}
				
				// 표시형식 지정
				if (type && type['element'] === 'date') {
					column['styles']['datetimeFormat'] = type["format"];
				} else if (type["element"] === "money") {
					column['styles']['numberFormat'] = type["format"];
				}
			}
			
		} else {
			// type이 없는경우
			column['type'] = 'data';
			// 배경색 지정
			if (status === 'required') {
				column['styles'] = {
						background: '#fff9cd'
				};
			} else if (status === 'disabled') {
				column['styles'] = {
						background: '#f6f6f6'
				};
			}
			
			// 정렬 지정
			if (align) {
				column['styles']['textAlignment'] = align;
			} else {
				if (fieldType === 'text') {
					column['styles']['textAlignment'] = 'center';
				} else if (fieldType === 'number') {
					column['styles']['textAlignment'] = 'far';
				} else {
					column['styles']['textAlignment'] = 'near';
				}
			}
		}
		
		if (dynamicStyles) {
			var dynamicStylesLength = dynamicStyles.length;
			for (var j = 0; j < dynamicStylesLength; j++) {
				var dStyle = {
						styles: dynamicStyles[j].styles,
						criteria: dynamicStyles[j].criteria
				};
				column['dynamicStyles'].push(dStyle);
			}
		}
		
		//footer option(?)
		if (type && type["sum"] === 'Y') {
			column['footer'] = {
					expression: 'sum',
					groupExpression: 'sum',
					styles: {
						textAlignment: 'far',
						numberFormat: type["format"]
					}
			};
		}
		
		// 그룹 컬럼인 경우 재귀호출
		var subGroupInfo;
		if (subColumns) {
			subGroupInfo = makeRealGridFieldAndColumn(gridView, subColumns);
			column['type'] = 'group';
			column['columns'] = subGroupInfo['columns'];
		}
		
		// set field and column information
		if (subColumns) {
			// 그룹컬럼인 경우 자식그룹에서 필드정보를 가져온다.
			var subGroupFields = subGroupInfo['fields']
			var subGroupLength = subGroupFields.length;
			for (var k = 0; k < subGroupLength; k++) {
				fields.push(subGroupFields[k]);
			}
			columns.push(column);
		} else {
			fields.push(field);
			columns.push(column);
		}
	} // end for
	
	// return result
	return {
		fields:  fields,
		columns: columns,
		gridView: gridView
	};
}