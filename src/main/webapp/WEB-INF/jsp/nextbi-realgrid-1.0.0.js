/**
 * Copyright 2016 NCSOFT.
 * All right reserved.
 *
 * This software is the confidential and proprietary information of NCSOFT.
 * You shall not disclose such Confidential Information and
 * shall use it only in accordance with the terms of the license agreement
 * you entered into with NCSOFT.
 */

var __tabReplaceStringBef = "__TabUniqueId__";
var __tabReplaceString = "TabUniqueId";
var __gridDpArray = {};

nextbi.realgrid = (function() {
	return {
		/**
		 * real-grid component 생성
		 * @param gridId
		 * @param grid
		 * @param provider
		 * @param fieldInfo
		 * @param options - {grid: {}, provider: {}, gridbar : {}, footer: {}, checkabr: {}}
		 * @returns
		 */
		createGrid: function(gridId, grid, provider, fieldInfo, options) {
			var gridInfoJson = nextbi.realgrid.setGridInfoJson(grid, fieldInfo);		
			options = $.extend(true, {
				grid: {
					hideDeletedRows: true
				},
				provider: {
					softDeleting: true
				},
	        	gridbar: {
	        		add         : true,
		            insertion   : true,
		            copy        : true,
		            remove      : true,
		            excel       : true,
		            expand      : true,
		            gridView    : grid,
		            dataProvider: provider,
		            columns     : gridInfoJson['columns'],
		            fields      : gridInfoJson['fields'],  
		            showStateBar: true,
		            showCheckBar: true 
	        	},
	        	footer: {
	        		visible: false
	        	},
	        	checkbar: {
	        		visible: false
	        	},
	        	popup: {
	        		cellEdited: {
	        			enabled: true,
	        		},
	        		cellButtonClicked : {
	        			enabled: true
	        		}
	        	},
	        	cellButtonClicked : function() {},
	        	cellEdited : function() {},
	        	cellDeleted : function() {},
	        	editRowPasted : function() {},
	        	rowsPasted : function() {},
	        	editCommit : function() {},	        	
	        }, options);
			
			grid.setOptions(options.grid);
	        provider.setOptions(options.provider);
	        nextbi.realgrid.gridbar(null, $("#" + gridId), options.gridbar);
	        
	        $("#" + gridId).data("grid", grid);
	        $("#" + gridId).data("provider", provider);
	        
	        grid.setFooter(options.footer);
	        grid.setCheckBar(options.checkbar);
	        grid.setColumnProperty("lookupShowBtn", "alwaysShowButton", true);
	        
	        
	        grid.onEditCommit = options.editCommit;
	        
	        //START popup init
	        var popupList = [];
	        grid.popupList = popupList;
	        
	        fieldInfo.forEach(function(fieldObj) {
	        	if(fieldObj.type !== undefined && fieldObj.type.element === "popup") {
	        		var popupObj = common_popup().init({
	        		    code : fieldObj.type.code,
	        			condition : fieldObj.type.condition,
	            		callback : function(rowData, popupObj) {
	            			var itemIndex = grid.getCurrent().itemIndex;
	        	            if(rowData.length === 1) {
	        	            	fieldObj.type.bind.forEach(function(bindInfo) {
	        	            		grid.setValue(itemIndex, bindInfo.fieldName, rowData[0][bindInfo.key]);
	        	            	});
	        	            	if(Object.prototype.toString.call(fieldObj.type.okCallback) === "[object Function]") {
	        	            		fieldObj.type.okCallback(rowData[0]);
	        	            	}
	        	            } else {
	        	            	fieldObj.type.bind.forEach(function(bindInfo) {
	        	            		grid.setValue(itemIndex, bindInfo.fieldName, "");
	        	            	});
	        	            	
	        	            	popupObj.setParam({popupUnique : "_grid_" + grid.getCurrent().column + "_" + itemIndex}); //같은 column에 다른 row를 클릭=> 창 열림, 같은 column에 같은 row 클릭=> 창 닫힘
	        	            	popupObj.dialog();
	        	            }
	        			},
	                    okCallback : function(rowData) {
	                    	var itemIndex = grid.getCurrent().itemIndex;
        	            	fieldObj.type.bind.forEach(function(bindInfo) {
        	            		grid.setValue(itemIndex, bindInfo.fieldName, rowData[bindInfo.key]);
        	            	});
        	            	
        	            	if(Object.prototype.toString.call(fieldObj.type.okCallback) === "[object Function]") {
        	            		fieldObj.type.okCallback(rowData);
        	            	}
        	            	
        	            	grid.setFocus();
	                    },
	                    closeCallback : function() {
        	            	grid.setFocus();
	                    }
	        		});
	        		
	        		popupList.push({
	        			popupObj : popupObj,
	        			fieldObj : fieldObj
	        		});
	        	}
	        });
	        //END popup init
	        
	        
	        grid.onCellEdited = function(p_grid, itemIndex, dataRow, field) {
	        	var result = options.cellEdited(p_grid, itemIndex, dataRow, field);
	        	
	        	if(result === false) {
	        		return false;
	        	}
	        	
	        	if(options.popup.cellEdited.enabled) {
	        		var selectedColumn = p_grid.getCurrent().column;
	        		popupList.forEach(function(popup) {
	        			if(popup.fieldObj.fieldName === selectedColumn) {
	        				var cellValue = p_grid.getValue(itemIndex, selectedColumn);
	        				if(cellValue === "") {
	        	            	popup.fieldObj.type.bind.forEach(function(bindInfo) {
	        	            		grid.setValue(itemIndex, bindInfo.fieldName, "");
	        	            	});
	        	            	
	        				} else {
	        					popup.popupObj.getValue(cellValue);	
	        				}
	        			}
	        		});
	        	}
	        	
	        	grid.commit();
	        }
	        
	    	grid.onCellButtonClicked =  function (p_grid, itemIndex, column) {
	    		var result = options.cellButtonClicked(p_grid, itemIndex, column);
	    		if(result === false) {
	    			return;
	    		}
	    		
	    		if(options.popup.cellButtonClicked.enabled) {
	        		var selectedColumn = p_grid.getCurrent().column;
	        		popupList.forEach(function(popup) {
	        			if(popup.fieldObj.fieldName === selectedColumn) {
//		        			var cellValue = p_grid.getValue(itemIndex, selectedColumn);
//	        				popup.popupObj.getValue(cellValue);
	        				popup.popupObj.setParam({popupUnique : "_grid_" + selectedColumn + "_" + itemIndex});	        				
	        				popup.popupObj.dialog({searchWord : ""});
	        			}
	        		});
	        	}
	    	};
	    	
	        grid.onEditRowPasted = function(grid, itemIndex, dataRow, fields, oldValues, newValues) {
	        	var selFieldList = [];

	        	//붙여넣기 시, 대문자 변경
	        	var displayColumns = provider.getFields();
	        	
	        	$.each(fields, function(idx, field) {
		        	var selFieldInfo = $.grep(fieldInfo, function(obj) {
		        		 return obj.fieldName  === displayColumns[field].orgFieldName;
		        	})[0];
	        		
		        	if(selFieldInfo.type !== undefined && selFieldInfo.type.textCase === "upper") {
        				var newValue;
        	        	if(newValues[0] === undefined) { //새로입력
            				if(newValues.length === 1) {
            					newValue = newValues[0];
            				} else {
            					newValue = newValues[field];
            				}        	        		
        	        	} else {
            				if(newValues.length === 1) { //가로입력
            					newValue = newValues[0];
            				} else {
            					newValue = newValues[idx];
            				}
        	        	}
        	        	
		        		grid.setValue(itemIndex, selFieldInfo.fieldName, (newValue+"").toUpperCase());
		        	}
	        	});
	        	
	        	//붙여넣기 시, 팝업key binding
	        	$.each(fields, function(idx, field) {
		        	var selFieldInfo = $.grep(fieldInfo, function(obj) {
		        		 return obj.fieldName  === displayColumns[field].orgFieldName;
		        	})[0];	        		
	        		
		        	popupList.forEach(function(popup) {
	        			if(popup.fieldObj.fieldName === selFieldInfo.fieldName) {
	        				var newValue;
	        	        	if(newValues[0] === undefined) { //새로입력
	            				if(newValues.length === 1) {
	            					newValue = newValues[0];
	            				} else {
	            					newValue = newValues[field];
	            				}        	        		
	        	        	} else {
	            				if(newValues.length === 1) { //가로입력
	            					newValue = newValues[0];
	            				} else {
	            					newValue = newValues[idx];
	            				}
	        	        	}
	        					
		        			popup.popupObj.getValue(newValue, function(rowData) {
		        				if(rowData.length === 1) {
		        					popup.fieldObj.type.bind.forEach(function(bindInfo) {
		        	            		grid.setValue(itemIndex, bindInfo.fieldName, rowData[0][bindInfo.key]);
		        	            	});
		        				} else {
		        					popup.fieldObj.type.bind.forEach(function(bindInfo) {
		        	            		grid.setValue(itemIndex, bindInfo.fieldName, "");
		        	            	});
		        				}
		        			});
	        			}
	        		});
	        	});
	        	
	        	options.editRowPasted(grid, itemIndex, dataRow, fields, oldValues, newValues);
	        }
	        
		},
		
		 
		/**
		 * real-grid field, column setting
		 * @param gridView
		 * @param fieldInfoJson
		 * @returns
		 */
		setGridInfoJson : function(gridView, fieldInfoJson){  
		   var _fields = "";
		   var _columns = "";
		   var len = fieldInfoJson.length;
		   for (var i = 0; i < len; i++) {
		        var _fieldName = fieldInfoJson[i].fieldName;
		        var _fieldType = fieldInfoJson[i].fieldType;
		        var _editable = fieldInfoJson[i].editable;
		        var _type = fieldInfoJson[i].type;
		        var _visible = fieldInfoJson[i].visible;
		        var _width = fieldInfoJson[i].width;
		        var _text = fieldInfoJson[i].text;
		        var _status = fieldInfoJson[i].status;
		        var _subColumns = fieldInfoJson[i].subColumns;
		        var _align = fieldInfoJson[i].align;
		        var _dynamicStyles = fieldInfoJson[i].dynamicStyles;
		        var _defaultValue = fieldInfoJson[i].defaultValue;
		        
		        var _typeName = "";
		        var _col = "";
		        _col += '{';
		        _col += '    name : "' + _fieldName + '",';
		        _col += '    fieldName : "' + _fieldName + '",';
		        if (_defaultValue) {
		        	_col += '    defaultValue : "' + _defaultValue + '",';
		        }
		        if(!nextbi.common.utils.isNull(_type)){
		           if($.trim(_type["element"]) == "dropDown"){
		        	   _col += '    editor: {';
		        	   _col += '        domainOnly: true, ';            //목록에 있는 값들만 지정할 수 있게
		        	   _col += '        textReadOnly: true, ';         //true이면 키보드로 입력이 안되고 선택만 가능하게 된다.
		        	   _col += '        dropDownWhenClick : true, '; 
		        	   _col += '        type: "' + _type["element"] + '"';
		        	   _col += '    },';
		        	   _col += '    values: [' + _type["values"] + '] ,';
		        	   _col += '    labels: [' + _type["labels"] + '] ,';
		        	   _col += '    lookupDisplay: true, ';         //label 값을 표시
		           }else if($.trim(_type["element"]) == "popup"){
		        	   _col += '        button: "action" ,';
		           }else if($.trim(_type["element"]) == "button"){
		        	   _col += '        button: "action" ,';
		           }else if($.trim(_type["element"]) == "checkbox"){
		        	   _col += '    renderer: {';
		        	   _col += '        type: "check" ,';
		        	   _col += '        editable: true ,';
		        	   _col += '        startEditOnClick: true ,';
		        	   _col += '        trueValues: "' + _type["trueValue"] + '" ,';
		        	   _col += '        falseValues: "' + _type["falseValue"] + '"';
		        	   _col += '    },'; 
		        	   _col += '    dynamicStyles: [{';
		        	   _col += '        criteria: "value = \'' + _type["trueValue"] + '\' "';
		        	   _col += '    }],';
		           }else if($.trim(_type["element"]) == "date"){  
		        	   _col += '    editor: {';
		        	   _col += '        type: "date",';   
		        	   _col += '        datetimeFormat: "' + _type["format"] + '",';
		        	   
		        	   switch(G_USER_LANG_CODE) {
		        	   	case "EN" :
//	        	   		_col += '        "yearDisplayFormat": "{Y} Year",';				       	    
//		        	   	_col += '        "monthDisplayFormat": "{M} Month",';
//		        	   	_col += '        "weekDays": ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],';
		        	   		break;
		        	   	case "KR" :
//		        	   		_col += '        "yearDisplayFormat": "{Y}년",';				       	    
//			        	   	_col += '        "monthDisplayFormat": "{M}월",';
//			        	   	_col += '        "weekDays": ["일", "월", "화", "수", "목", "금", "토"],';
		        	   		break;		        	   	
		        	   }
		        	   _col += '    },';
		           }else if($.trim(_type["element"]) == "img"){
		               //$.nui.modal.createModalImageList(gridView);
		               _col += '        imageList: "modalImage",';   
		               _col += '    renderer: {';
		               _col += '        type: "icon"';
		               _col += '    },';
		               _col += '    styles: {';    
		               _col += '        iconIndex: 0,';
		               _col += '        textAlignment: "near",';   
		               _col += '        iconLocation: "right",';     
		               _col += '        iconAlignment: "center",';
		               _col += '        iconPadding: 100,';
		               if($.trim(_status) == "required"){
		            	   _col += '        background: "#fff9cd"';    
		               }else if($.trim(_status) == "disabled"){
		            	   _col += '        background: "#f6f6f6"';
		               }
		               _col += '    },';
		           }else if($.trim(_type["element"]) == "drillDown"){
		               //$.nui.modal.createModalImageList(gridView);
		               _col += '        imageList: "modalImage",';   
		               _col += '    renderer: {';
		               _col += '        type: "icon"';
		               _col += '    },';
		               _col += '    styles: {';    
		               _col += '        iconIndex: 0,';
		               _col += '        iconLocation: "center",';     
		               _col += '        iconAlignment: "center",';
		               _col += '        iconPadding: 100,';
		               if($.trim(_status) == "required"){
		                   Col += '        background: "#fff9cd"';    
		               }else if($.trim(_status) == "disabled"){
		            	   _col += '        background: "#f6f6f6"';
		               }
		               _col += '    },';
		           }else if($.trim(_type["element"]) == "line"){
		        	   _col += '    editor: {';
		        	   _col += '        type: "' + _type["element"] + '",';
		        	   _col += '        maxLength: ' + _type["maxLength"] + ','; // 최대입력길이 / 0이면 무한
		        	   _col += '        textCase: "' + _type["textCase"] + '",'; // 대소문자 변환 / default가 기본값
		        	   _col += '    },';
		           }else if($.trim(_type["element"]) == "number"){
		        	   _col += '    editor: {';
		        	   _col += '        type: "' + _type["element"] + '",';
		        	   _col += '        positiveOnly: true, '; // 양수값만 가능
		        	   _col += '    },';
		           }
		           if($.trim(_type["element"]) != "img" && $.trim(_type["element"]) != "drillDown"){
		        	   _col += '    styles: {';
		                   if($.trim(_status) == "required"){   
		                	   _col += '        background: "#fff9cd", ';
		                   }else if($.trim(_status) == "disabled"){
		                	   _col += '        background: "#f6f6f6", ';
		                   }
		                   if(!nextbi.common.utils.isNull(_type) && $.trim(_type["element"]) == "date"){
		                	   _col += '        datetimeFormat: "' + _type["format"] + '" ,';
		                   }  
//		                                 가운데정렬 제거 2016.12.02 jonghyeon
//		                                 if(FieldName.toUpperCase().indexOf("ID") != -1 || FieldName.toUpperCase().indexOf("SEQ") != -1){
//		                                     Col += '        textAlignment: "center"'; //가운데 정렬
//		                                 }else{
		                  	  if (!nextbi.common.utils.isNull(_align)) {
		                  		_col += '        textAlignment: "' + _align + '"';
		                  	  } else {
		                  		  if($.trim(_fieldType) == "text"){
		                  			_col += '        textAlignment: "center"'; //가운데 정렬
		                  		  }else if($.trim(_fieldType) == "number"){
		                  			_col += '        textAlignment: "far"';      //오른쪽 정렬
		                  		  }else{
		                  			_col += '        textAlignment: "near"';    //왼쪽 정렬 
		                  		  }
		                  	  }
//		                                 }
		                   if($.trim(_type["element"]) == "money"){  
		                       if(!nextbi.common.utils.isNull(_type["format"])){  
		                    	   _col += '        , numberFormat:"' + _type["format"] + '"';
		                       }else{
		                    	   _col += '        , numberFormat:"#,##0.##"';
		                       }
		                   } 
		                   _col += '    },';       
		           }
		        }else{
		        	_col += '    type: "data",';
		        	_col += '    styles: {';
		           if($.trim(_status) == "required"){   
		        	   _col += '        background: "#fff9cd", ';
		           }else if($.trim(_status) == "disabled"){
		        	   _col += '        background: "#f6f6f6", ';
		           }
		           if(!nextbi.common.utils.isNull(_type) && $.trim(_type["element"]) == "date"){
		        	   _col += '        datetimeFormat: "' + _type["format"] + '" ,';
		           }  
		           if(!nextbi.common.utils.isNull(_align)){ 
		        	   _col += '        textAlignment: "' + _align + '"';
		           }else{
		               if(_fieldName.toUpperCase().indexOf("ID") != -1 || _fieldName.toUpperCase().indexOf("SEQ") != -1){
		            	   _col += '        textAlignment: "center"'; //가운데 정렬
		                }else{
		                   if($.trim(_fieldType) == "text"){
		                	   _col += '        textAlignment: "center"'; //가운데 정렬
		                    }else if($.trim(_fieldType) == "number"){
		                    	_col += '        textAlignment: "far"';      //오른쪽 정렬
		                    }else{
		                    	_col += '        textAlignment: "near"';    //왼쪽 정렬
		                    }
		               }
		           }
		           
		           _col += '    },';  
		        }
		        if(!nextbi.common.utils.isNull(_editable)){ 
		        	_col += '    editable: false ,';
		        }
		        if(!nextbi.common.utils.isNull(_visible) && !_visible){  
		        	_col += '    visible: ' + _visible + ',';
		        }   
		        if(!nextbi.common.utils.isNull(_width)){
		        	_col += '    width: "' + _width + '",';
		        }
		        
		        if(!nextbi.common.utils.isNull(_dynamicStyles)){
		        	_col += ' dynamicStyles: [';
		            var styleLen = _dynamicStyles.length;
		            for (var k = 0; k < styleLen; k++) {
		                if(k > 0){
		                	_col += ',';
		                }
		                _col += '{';
		                _col += 'criteria : "' + _dynamicStyles[k].criteria + '",';
		                _col += 'styles : "' + _dynamicStyles[k].styles + '"';
		                _col += '}';
		            }
		            _col += ' ],';
		        }
		        _col += '    header: {';
		        _col += '        text: "' + _text +'"';
		        _col += '    }';
		        
		        if(!nextbi.common.utils.isNull(_type) && $.trim(_type["sum"]) == "Y"){
		            if(!nextbi.common.utils.isNull(_type["format"])){
		            	_col += ', footer : {expression : "sum", groupExpression : "sum", styles : {"textAlignment": "far", numberFormat:"' + _type["format"] + '"}}';
		            }else{
		            	_col += ', footer : {expression : "sum", groupExpression : "sum", styles : {"textAlignment": "far", numberFormat:"#,##0.##"}}';
		            }
		        }
		        if(!nextbi.common.utils.isNull(_subColumns)){
		        	_col += '  , type       : "group"';      
		        	_col += '  , columns       : [';
		            var subLen = _subColumns.length;
		            for (var j = 0; j < subLen; j++) {
		                var sbFieldName = _subColumns[j].fieldName;
		                var sbFieldType = _subColumns[j].fieldType;
		                var sbWidth = _subColumns[j].width;
		                var sbStatus = _subColumns[j].status;
		                var sbAlign = _subColumns[j].align;
		                var sbType = _subColumns[j].type;
		                var sbVisible = _subColumns[j].visible;
		                var sbDynamicStyles = _subColumns[j].dynamicStyles;
		                
		                if(nextbi.common.utils.isNull(sbVisible)){ 
		                    sbVisible = true;
		                }
		                _fields += '{ fieldName : "' + sbFieldName + '", dataType : "' + sbFieldType + '" },';
		                _col += '                   { name          : "' + sbFieldName + '",';
		                _col += '                     fieldName     : "' + sbFieldName + '",';
		                if(!nextbi.common.utils.isNull(sbType)){
		                    if($.trim(sbType["element"]) == "dropDown"){ 
		                    	_col += '    editor: {';
		                    	_col += '        domainOnly: true, ';            //목록에 있는 값들만 지정할 수 있게
		                    	_col += '        textReadOnly: true, ';         //true이면 키보드로 입력이 안되고 선택만 가능하게 된다.
		                    	_col += '        dropDownWhenClick : true, ';
		                    	_col += '        type: "' + sbType["element"] + '"';
		                    	_col += '    },';
		                    	_col += '    values: [' + sbType["values"] + '] ,';
		                    	_col += '    labels: [' + sbType["labels"] + '] ,';
		                    	_col += '    lookupDisplay: true, ';         //label 값을 표시 
		                    }else if($.trim(sbType["element"]) == "button"){
		                    	_col += '       button: "action",';     
		                    }else if($.trim(sbType["element"]) == "date"){  
		                    	_col += '    editor: {';
		                    	_col += '        type: "date",';     
		                    	_col += '        datetimeFormat: "' + sbType["format"] + '"';
		                    	_col += '    },';
		                    }else if($.trim(sbType["element"]) == "img"){
		                        //$.nui.modal.createModalImageList(gridView);
		                        _col += '        imageList: "modalImage",';   
		                        _col += '    renderer: {';
		                        _col += '        type: "icon"';
		                        _col += '    },';
		                        _col += '    styles: {';    
		                        _col += '        iconIndex: 0,';
		                        _col += '        textAlignment: "near",';   
		                        _col += '        iconLocation: "right",';     
		                        _col += '        iconAlignment: "center",';
		                        _col += '        iconPadding: 100,';
		                        if($.trim(sbStatus) == "required"){
		                        	_col += '        background: "#fff9cd"';    
		                        }else if($.trim(sbStatus) == "disabled"){
		                        	_col += '        background: "#f6f6f6"';
		                        }
		                        _col += '    },';
		                    }else if($.trim(sbType["element"]) == "drillDown"){
		                        //$.nui.modal.createModalImageList(gridView);
		                        _col += '        imageList: "modalImage",';   
		                        _col += '    renderer: {';
		                        _col += '        type: "icon"';
		                        _col += '    },';
		                        _col += '    styles: {';    
		                        _col += '        iconIndex: 0,';
		                        _col += '        iconLocation: "center",';     
		                        _col += '        iconAlignment: "center",';
		                        _col += '        iconPadding: 100,';
		                        if($.trim(sbStatus) == "required"){
		                        	_col += '        background: "#fff9cd"';    
		                        }else if($.trim(sbStatus) == "disabled"){
		                        	_col += '        background: "#f6f6f6"';
		                        }
		                        _col += '    },'; 
		                    }else if($.trim(sbType["element"]) == "checkbox"){
		                    	_col += '    renderer: {';
		                    	_col += '        type: "check" ,';
		                    	_col += '        editable: true ,';
		                    	_col += '        trueValues: "' + sbType["trueValue"] + '" ,';
		                    	_col += '        falseValues: "' + sbType["falseValue"] + '"';
		                    	_col += '    },'; 
		                    	_col += '    dynamicStyles: [{';
		                    	_col += '        criteria: "value = \'' + sbType["trueValue"] + '\' "';
		                    	_col += '    }],';
		                    }
		                    
		                    if($.trim(sbType["element"]) != "img" && $.trim(sbType["element"]) != "drillDown"){
		                    	_col += '                     styles        : {';
		                        if(!nextbi.common.utils.isNull(sbAlign)){ 
		                        	_col += '        textAlignment: "' + sbAlign + '"';
		                        }else{
		                            if($.trim(sbFieldType) == "text"){
		                            	_col += '        textAlignment: "center"'; //가운데 정렬
		                             }else if($.trim(sbFieldType) == "number"){
		                            	 _col += '        textAlignment: "far"';      //오른쪽 정렬
		                             }else{
		                            	 _col += '        textAlignment: "near"';    //왼쪽 정렬 
		                            }
		                        }
		                        if(!nextbi.common.utils.isNull(sbType) && $.trim(sbType["element"]) == "money"){
		                            if(!nextbi.common.utils.isNull(sbType["format"])){
		                            	_col += '        , numberFormat:"' + sbType["format"] + '"';
		                            }else{
		                            	_col += '        , numberFormat:"#,##0.##"';
		                            }
		                        }
		                        if($.trim(sbStatus) == "disabled"){
		                        	_col += '        , background: "#f6f6f6"';
		                        }else  if($.trim(sbStatus) == "required"){      
		                        	_col += '        , background: "#fff9cd"'; 
		                        }
		                        _col += '                     }, ';
		                    }
		                }else{
		                	_col += '                     type          : "data",';
		                	_col += '                     styles        : {';
		                    if(!nextbi.common.utils.isNull(sbAlign)){ 
		                    	_col += '        textAlignment: "' + sbAlign + '"';
		                    }else{
		                        if($.trim(sbFieldType) == "text"){
		                        	_col += '        textAlignment: "center"'; //가운데 정렬
		                         }else if($.trim(sbFieldType) == "number"){
		                        	 _col += '        textAlignment: "far"';      //오른쪽 정렬
		                         }else{
		                        	 _col += '        textAlignment: "near"';    //왼쪽 정렬 
		                        }
		                    }
		                    if(!nextbi.common.utils.isNull(sbType) && $.trim(sbType["element"]) == "money"){
		                        if(!nextbi.common.utils.isNull(sbType["format"])){
		                        	_col += '        , numberFormat:"' + sbType["format"] + '"';
		                        }else{
		                        	_col += '        , numberFormat:"#,##0.##"';
		                        }
		                    }
		                    if($.trim(sbStatus) == "disabled"){
		                    	_col += '        , background: "#f6f6f6"';
		                    }else  if($.trim(sbStatus) == "required"){      
		                    	_col += '        , background: "#fff9cd"';  
		                    }
		                    _col += '                     }, ';
		                }  
		                _col += '                     width         : "' + sbWidth + '",';
		                _col += '                     visible       : ' + sbVisible + ',';
		                if(!nextbi.common.utils.isNull(sbDynamicStyles)){
		                    Col += ' dynamicStyles: [';
		                    var subStyleLen = sbDynamicStyles.length;
		                    for (var k = 0; k < subStyleLen; k++) {
		                        if(k > 0){
		                            Col += ',';
		                        }
		                        _col += '{';
		                        _col += 'criteria : "' + sbDynamicStyles[k].criteria + '",';
		                        _col += 'styles : "' + sbDynamicStyles[k].styles + '"';
		                        _col += '}';
		                    }
		                    _col += ' ],';
		                }  
		                _col += '                     header        : { text : "' + (!nextbi.common.utils.isNull(_subColumns[j].text)? "" : _subColumns[j].text) + '" }';
		                
		                if(!nextbi.common.utils.isNull(sbType) && $.trim(sbType["sum"]) == "Y"){
		                    if(!nextbi.common.utils.isNull(sbType["format"])){
		                    	_col += ', footer : {expression : "sum", groupExpression : "sum", styles : {"textAlignment": "far", numberFormat:"' + sbType["format"] + '"}}';
		                    }else{
		                    	_col += ', footer : {expression : "sum", groupExpression : "sum", styles : {"textAlignment": "far", numberFormat:"#,##0.##"}}';
		                    }
		                }
		                if(j == (_subColumns.length -1)){ 
		                	_col += '                   }';
		                }else{
		                	_col += '                   },';
		                }
		           }   
		            _col += '                 ]';
		        }
		        _col += '},';

		        if(i == 0){
		           _fields += '[';
		           _fields += '{ fieldName : "' + _fieldName + '", dataType : "' + _fieldType + '" },';
		           
		           _columns += '[';
		        }
		        if(i == (fieldInfoJson.length -1)){
		        	_fields += '{ fieldName : "' + _fieldName + '", dataType : "' + _fieldType + '" }';
		        	_fields += ']';

		        	_columns += _col;
		        	_columns += ']';
		        }else{
		        	_fields += '{ fieldName : "' + _fieldName + '", dataType : "' + _fieldType + '" },';

		        	_columns += _col;
		        }
		   }
		   return {fields : eval(_fields) , columns : eval(_columns), gridView : gridView}; 
		}, 
		
		gridbar : function (p_tabId, p_gridElement, p_option){
            var _result = new gridbarObject(p_tabId, p_gridElement, p_option);
            return _result;
        },
        appendRow: function(gridId, callback) {
        	var _grid = $("#"+gridId).data("grid");
        	var _provider = $("#"+gridId).data("provider");
        	_grid.commit(true);
        	_grid.beginAppendRow();
        	_grid.showEditor();					// edit 모드
        	_grid.setFocus();					// focusing
        	
        	if(typeof callback === 'function') {
        		callback(_grid, _provider);
        	}
        },
        removeRow: function(gridId, callback) {
        	var _grid = $("#"+gridId).data("grid");
        	var _provider = $("#"+gridId).data("provider");
        	_grid.deleteSelection(true);        	
        	if(typeof callback === 'function') {
        		callback(_grid, _provider);
        	}
        },
        isValid: function(gridId, dataList, fieldInfo, callback) {
        	var _provider = $("#"+gridId).data("provider");
        	
        	var vdataList = []; 
        	for(var i = 0; i < dataList.length; i++) {
        		if(dataList[i].state === "created" || dataList[i].state === "updated") {
        			vdataList.push(dataList[i]);
        		}
        	}
        	if(vdataList.length < 1) {
        		return true;
        	}
        	
        	var _mapValid = {};
        	for (var i in fieldInfo) {
        		var item = fieldInfo[i];
        		if(item["validation"]) {
        			var _arrayVaild = [];
        			var _fieldName = item.fieldName;
        			
        			item.validation = item.validation.length ? item.validation : [item.validation];
        			for(var k = 0; k < item.validation.length; k++) {
        				var _validate = item.validation[k];
        				
        				if(Object.prototype.toString.call(_validate.type) == "[object Array]") {
        					_validate.type.forEach(function(type) {
                				_arrayVaild.push({
                					checkType: type,
                					regExp: nextbi.common.utils.nvl(_validate.regExp, ""),
                					falseMessage: _validate.message,
                					columnText : item.text
                				});        						
        					});
        				} else if(Object.prototype.toString.call(_validate.type) == "[object String]") {
            				_arrayVaild.push({
            					checkType: _validate.type,
            					regExp: nextbi.common.utils.nvl(_validate.regExp, ""),
            					falseMessage: _validate.message,
            					columnText : item.text
            				});
        				}
        			}
        			_mapValid[_fieldName] = _arrayVaild;
        		}
        	}
        	
        	//TODO
        	for(var i = 0; i < dataList.length; i++) {
        		var _item = dataList[i];
        		for(var key in _mapValid) {
        			var _targetField = key;
        			var _targetValue = _item[key];
        			var _arrValid = _mapValid[key];
        			for(var k = 0; k < _arrValid.length; k++) {
        				var itemValid = _arrValid[k];
        				var flag = false;
        				
        				var  defaultMessage = "";
        				switch (itemValid.checkType) {
        				case "required":
        					flag = (_targetValue === null || _targetValue === undefined || _targetValue === "") ? true : false;
        					defaultMessage = messageSource["common.grid.message.validation.required"];
        					break;
        				case "number":
        					var regExp = /\D/g;
        					flag = regExp.test(_targetValue);
        					defaultMessage = messageSource["common.grid.message.validation.number"];
        					break;
        				case "string":
        					var regExp = /[^a-zA-Z]/;
        					flag = regExp.test(_targetValue);
        					defaultMessage = messageSource["common.grid.message.validation.string"];
        					break;
        				case "upperCase":
        					var regExp = /[^A-Z]/;
        					flag = regExp.test(_targetValue);
        					defaultMessage = messageSource["common.grid.message.validation.upperCase"];
        					break;
        				case "lowerCase":
        					var regExp = /[^a-z]/;
        					flag = regExp.test(_targetValue);
        					defaultMessage = messageSource["common.grid.message.validation.lowerCase"];
        					break;
        				case "notKor":
        					var regExp = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        					flag = regExp.test(_targetValue);
        					defaultMessage = messageSource["common.grid.message.validation.notKor"];
        					break;        					
        				case "regExp":
        					var regExp = new RegExp(itemValid.regExp);
        					flag = !regExp.test(_targetValue);
        					break;
        				default: 
        					break;
        				}
        				
        				if(flag) {
        					var message = itemValid.falseMessage;
        					if(!message) {
        						message = itemValid.columnText + defaultMessage;
        					}
        					nextbi.common.component.errorMsg(message);
        					return false;
        				}
        			}
        		}
        	}
        	return true;
        },
        /**
         * function grid data save 
         * @param gridId
         * @param options - {url = "", param = {}}
         * @returns
         */
        saveGrid: function(gridId, options) {
        	var _provider = $("#"+gridId).data("provider");
        	nextbi.common.utils.ajaxLoad(__context + options.url, options.param, function(p_data) {
        		_provider.clearRowStates(true);
        		nextbi.common.component.toastMsg(p_data.data); // 레이어팝업으로 변경해야함
        		if (typeof options.callback === 'function') {
					options.callback.call(this);
				}
			}, "POST", false);
        },
        /**
         * 
         * @param gridId
         * @param options - {
         * 				url = "",					//필수
         * 				param = {},					//비필수
         * 				isEdited: true,				//비필수	// 2016.12.08 사용안함 jonghyeon
         * 				saveFunction: function		//비필수
         * 				callbackFunction: function	//비필수
         *              form: jquery object         //비필수 - 검색 form // 2016.12.15 추가(종현)
         *              formValid: boolean          //비필수 - form 검증(모든 form 을 검증한다. 단, form이 있으면 무시된다.) // 2016.12.15 추가(종현)
         * 			}
         * @returns
         */
        bindData: function(gridId, options) {
        	var _grid = $("#"+gridId).data("grid");
        	var _provider = $("#"+gridId).data("provider");
        	
        	nextbi.common.component.handleJqueryValidation();
        	if (options["form"] && !options.form.valid()) {
        		return false;
        	} else if (options["formValid"] !== false && $("form").length > 0 && !$("form").valid()) {
        		return false;
        	}
        	
        	_grid.commit(true);
        	
        	if (nextbi.realgrid.isEdited(gridId) && typeof options.saveFunction === 'function') {
    			if (confirm(messageSource["common.message.basic.unsavedData"])) {
    				options.saveFunction.call(this, nextbi.realgrid.bindData(gridId, options));
    				return false;
    			}
        		/*nextbi.common.component.modalMsg("confirm","확인","저장되지 않은 값이 있습니다.\n저장하시겠습니까?",function(val){
        			if(val){
        				options.saveFunction.call(this, nextbi.realgrid.bindData(gridId, options));
        				return false;
        			}
        		});*/
    			_grid.cancel();
				_provider.clearRowStates(true);
    		}
        	
        	nextbi.common.utils.processing(true);
        	nextbi.common.utils.ajaxLoad(__context + options.url, options.param, function(p_data) {
        		_provider.setRows(p_data.data);
        		_grid.setCurrent({itemIndex : 0, column : _grid.getDisplayColumns()[0]});
        		if (typeof options.callbackFunction === 'function') {
        			options.callbackFunction.call(this);
        		}
        		nextbi.common.utils.processing(false);
			}, "GET", true);
        },
        /**
         * 그리드에 데이터바인드 전처리
         * @param params
         * - gridId(required)  : 처리대상. Parameter : array(다중), string(단일)
         * - save(option)      : 저장함수
         * - search(option)    : 검색함수
         * - form(option)      : 검색 form
         *   > type : jquery object
         * - formValid(option) : form 검증(모든 form 을 검증한다. 단, form이 있으면 무시된다.)
         *   > type : boolean(default true)
         * @returns void
         */
        beforeBindData: function(params) {
        	if (params["gridId"] === null || params["gridId"] === undefined || params["gridId"] === "") {
        		nextbi.common.component.errorMsg("missing gridId!");
        		return false;
        	}
        	
        	nextbi.common.component.handleJqueryValidation();
        	if (params["form"] && !params.form.valid()) {
        		return false;
        	} else if (params["formValid"] !== false && $("form").length > 0 && !$("form").valid()) {
        		return false;
        	}
        	
        	var gridIdArray = [];
        	if(Object.prototype.toString.call(params.gridId) === "[object Array]") {
        		gridIdArray = params.gridId;
        	} else {
        		gridIdArray.push(params.gridId)
        	}
        	
        	var isEdited = false;
        	gridIdArray.forEach(function(_gridId, idx) {
            	var _grid = $("#" + _gridId).data("grid");
            	var _provider = $("#" + _gridId).data("provider");
            	
            	if(nextbi.realgrid.isEdited(_gridId)) {
            		isEdited = true;
            	}
        	});
        	
        	
        	if (isEdited && typeof params.save === "function" && typeof params.search === "function") {
        		/*
        		 * 레이어 확인창으로 변경 2016.12.20
    			if (confirm("저장되지 않은 값이 있습니다.\n저장하시겠습니까?")) {
    				params.save.call(this, params.search);
    				return false;
    			}
    			 */
        		nextbi.common.component.confirmMsg(messageSource["common.grid.unsavedDataHeader"], messageSource["common.message.basic.unsavedData"], function(confirm){
        			if (confirm) {
        				setTimeout(function(){
        					params.save.call(this, params.search);
        				}, 500);
        			} else {
        	        	gridIdArray.forEach(function(_gridId, idx) {
        	            	var _grid = $("#" + _gridId).data("grid");
        	            	var _provider = $("#" + _gridId).data("provider");

        	            	_grid.cancel();
        	            	_provider.clearRowStates(true);
        	        	});        				

        				setTimeout(function(){
        					params.search.call(this);
        				}, 500);
        			}
        		});
        		return false; // 레이어 확인창이 나타나면 여기서 중지
    		}
        	
        	gridIdArray.forEach(function(_gridId, idx) {
            	var _grid = $("#" + _gridId).data("grid");
            	var _provider = $("#" + _gridId).data("provider");

            	_grid.cancel();
            	_provider.clearRowStates(true);
        	});
        	
        	// 진행상태 레이어 삽입
        	nextbi.common.utils.processing(true);
        	
        	return true;
        },
        /**
         * 그리드에 데이터바인드 후처리
         * @param params
         * - gridId(required)   : 처리대상
         * - data(required)     : 입력데이터
         * - filterFlag(option) : 필터적용
         * @returns void
         */
        afterBindData: function(params) {
        	// 진행상태 레이어 제거
        	nextbi.common.utils.processing(false);
        	
        	if (params["gridId"] === null || params["gridId"] === undefined || params["gridId"] === "") {
        		nextbi.common.component.errorMsg("missing gridId!");
        		return false;
        	}
        	if (params["data"] === null || params["data"] === undefined || params["data"] === "") {
        		nextbi.common.component.errorMsg("missing data!");
        		return false;
        	}
        	
        	var _grid = $("#" + params.gridId).data("grid");
        	var _provider = $("#" + params.gridId).data("provider");
        	
        	_provider.setRows(params.data);
    		_grid.setCurrent({
    			itemIndex : 0,
    			column : _grid.getDisplayColumns()[0]
    		});
    		
    		if (params.filterFlag === null ||
    				params.filterFlag === undefined ||
    				params.filterFlag === "" ||
    				params.filterFlag === true) {
    			nextbi.realgrid.setFilters(params["gridId"], "all");
    		}
    		return true;
        },
        /**
         * 저장 전처리
         * @param params
         * - gridId(required) : 처리대상
         * - gridFieldInfo    : 그리드 필드정보(기본필드 검증을 하고싶으면 필요합니다. 단, 개별로 실행이 필요할 경우 따로 작성하면 됩니다.)
         * @returns void
         */
        beforeSave: function(params, isCheckEdited) {
        	if (params === null || params === undefined || params === "") {
        		nextbi.common.component.errorMsg("missing gridId!");
        		return false;
        	}
        	
        	var editedFlag = false;
        	var _gridArray = params.length ? params : [params]; // 다중그리드
        	for (var index in _gridArray) {
        		var _grid = $("#" + _gridArray[index].gridId).data("grid");
        		var _provider = $("#" + _gridArray[index].gridId).data("provider");
        		
        		// check edited data
        		editedFlag = nextbi.realgrid.isEdited(_gridArray[index].gridId) || editedFlag;
        		
        		// option process
        		if (_gridArray[index].gridFieldInfo) {
        			if (!nextbi.realgrid.isValid(_gridArray[index].gridId, nextbi.realgrid.createSaveDataJson(_gridArray[index].gridId), _gridArray[index].gridFieldInfo)) {
        				return false;
        			}
        		}
        	}
        	
        	if (!editedFlag && isCheckEdited !== false) {
        		nextbi.common.component.errorMsg(messageSource["common.message.basic.noSaveData"]);
    			return false;
    		}
        	
        	// 진행상태 레이어 삽입
        	// 여기에..
        	
        	return true;
        },
        /**
         * 저장 후처리
         * @param params
         * - gridId(required) : 처리대상
         * - data             : 결과데이터
         */
        afterSave: function(params) {
        	// 진행상태 레이어 제거
        	// 여기에..
        	
        	if (params === null || params === undefined || params === "") {
        		nextbi.common.component.errorMsg("missing gridId!");
        		return false;
        	}
        	
        	var _gridArray = params.length ? params : [params]; // 다중그리드
        	for (var index in _gridArray) {
        		
        		var _grid = $("#" + _gridArray[index].gridId).data("grid");
        		var _provider = $("#" + _gridArray[index].gridId).data("provider");
        		
        		// clear grid data
        		_provider.clearRowStates(true);
        	}
        	
        	// option
        	// to do...
        	
        	// 저장완료 메시지
        	nextbi.common.component.toastMsg(messageSource["common.message.basic.saveSuccess"]);
        	return true;
        },
        isEdited: function(gridId) {
        	var _grid = $("#"+gridId).data("grid");
        	var _provider = $("#"+gridId).data("provider");
        	
        	if (_grid.isItemEditing()) {
        		_grid.commitEditor(true);
        	}
        	_grid.commit();
        	
        	if (_provider.getAllStateRows().created.length > 0 ||
    				_provider.getAllStateRows().updated.length > 0 ||
    				_provider.getAllStateRows().deleted.length > 0) {
        		return true;
        	}
        	return false;
        },
        getChangedRowCount: function(gridId) {
        	return $("#"+gridId).data("provider").getRowStateCount("all");
        },
        createSaveDataJson: function(gridId) {
        	var _grid = $("#"+gridId).data("grid");
        	var _provider = $("#"+gridId).data("provider");
        	_grid.commit();
        	
        	var _rows = _provider.getAllStateRows();
        	var _action = ["created", "updated", "deleted"];
        	var _savedataList = [];
        	
        	var timezoneOffset = new Date().getTimezoneOffset();
        	for(var i = 0; i < _action.length; i++) {
        		var _len = _rows[_action[i]].length; 
        		if( _len > 0) {
        			for(var k = 0; k < _len; k++) {
        				var _rowdata = _provider.getJsonRow(_rows[_action[i]][k]);
        				_rowdata.row = _rows[_action[i]][k];
        				_rowdata.state = _action[i];
        				
        				//gmt string이 json.stringfy로 변환 시, -9 값으로 지정되는 현상 수정
        				for(rowKey in _rowdata) {
        				    if(Object.prototype.toString.call(_rowdata[rowKey]) === "[object Date]") {
        				      var time = _rowdata[rowKey];
        				       time.setHours(time.getHours() - timezoneOffset / 60);
        				    }
        				}
        				
        				_savedataList.push(_rowdata);
        			}
        		}
        	}
        	return _savedataList;
        },
        setFilters: function(gridId, columns) {
        	var _grid = $("#"+gridId).data("grid");
        	var _provider = $("#"+gridId).data("provider");
        	
        	if (columns === "all") {
        		var columnNames = _grid.getColumnNames();
        		var newColumns = [];
        		for (var index in columnNames) {
        			if (_grid.getColumnProperty(columnNames[index], "visible")) {
        				newColumns.push(columnNames[index]);
        			}
        		}
        		columns = newColumns;
        	} else {
        		columns = columns.length ? columns : [columns];
        	}
        	
        	_grid.setOptions({
        		filtering: {
        			selector: {
        				minWidth: 200,          // min, max 너비 높이는 "50%" 와 같은 형식으로 그리드 크기에 대한 비율로 지정할 수 있음.
        				maxWidth: 200,
        				maxHeight: 250,
        				closeWhenClick: false   // true면 항목 클릭 후 닫힘.
        			}
        		}
        	});
        	
        	for (var index in columns) {
        		var columnName = columns[index];
        		
        		var filters = [];
        		var distinctValues = _provider.getDistinctValues(columnName);
        		for (var i = 0; i < distinctValues.length; i++) {
        			var newFilter = {
        					name: distinctValues[i],
        					criteria: "value = '" + distinctValues[i] + "'"
        			};
        			filters.push(newFilter);
        		}
        		_grid.setColumnFilters(columnName, filters);
        	}
        }
	}
}());

/**
 * grid style 적용
 * @returns {___anonymous75797_107620}
 */

function getGridStyles() {
    var styles = {
        "grid" : {
            "paddingRight" : "2",
            "iconAlignment" : "center",
            "paddingTop" : "2",
            "iconIndex" : "0",
            "iconOffset" : "0",
            "iconLocation" : "left",
            "iconPadding" : "0",
            "paddingBottom" : "2",
            "contentFit" : "auto",
            "foreground" : "#ff000000",
            "hoveredMaskBackground" : "#1f5292f7",
            "selectedForeground" : "#ffffffff",
            "disabledForeground" : "#ff808080",
            "hoveredBackground" : "#1f5292f7",
            "textAlignment" : "center",
            "lineAlignment" : "center",
            "figureBackground" : "#ff008800",
            "paddingLeft" : "2",
            "figureInactiveBackground" : "#ffd3d3d3",
            "selectedBackground" : "#ff696969",
            "background" : "#ffffffff",
            "inactiveBackground" : "#ffd3d3d3",
            "font" : "Nanum Gothic,12",
            "border" : "#ffaaaaaa,0"

        },
        "panel" : {
            "borderRight" : "#ff777777,1",
            "paddingRight" : "2",
            "borderBottom" : "#ff688caf,1",
            "iconAlignment" : "center",
            "paddingTop" : "5",
            "iconIndex" : "0",
            "iconOffset" : "0",
            "iconLocation" : "left",
            "iconPadding" : "0",
            "paddingBottom" : "6",
            "contentFit" : "auto",
            "foreground" : "#ff787878",
            "hoveredMaskBackground" : "#1f5292f7",
            "selectedForeground" : "#ffffffff",
            "disabledForeground" : "#ff808080",
            "hoveredBackground" : "#1f5292f7",
            "textAlignment" : "near",
            "lineAlignment" : "center",
            "figureBackground" : "#ff008800",
            "paddingLeft" : "8",
            "figureInactiveBackground" : "#ffd3d3d3",
            "selectedBackground" : "#ff696969",
            "background" : "#ffdee2e7",
            "inactiveBackground" : "#ffd3d3d3",
            "font" : "Nanum Gothic,12",
            "border" : "#ff313539,1",
        },
        "body" : {
            "borderRight" : "#ffdedede,1",
            "paddingRight" : "5",
            "borderBottom" : "#ffdedede,1",
            "iconAlignment" : "center",
            "paddingTop" : "5",
            "iconIndex" : "0",
            "iconOffset" : "0",
            "iconLocation" : "left",
            "iconPadding" : "0",
            "paddingBottom" : "6",
            "contentFit" : "auto",
            "foreground" : "#ff101010",
            "hoveredMaskBackground" : "#1f5292f7",
            "selectedForeground" : "#ffffffff",
            "disabledForeground" : "#ff808080",
            "hoveredBackground" : "#1f5292f7",
            "textAlignment" : "center",
            "lineAlignment" : "center",
            "figureBackground" : "#ff008800",
            "paddingLeft" : "5",
            "figureInactiveBackground" : "#ffd3d3d3",
            "line" : "#ffd1d1d1,1",
            "selectedBackground" : "#ff696969",
            "background" : "#ffffffff",
            "inactiveBackground" : "#ffd3d3d3",
            "font" : "Nanum Gothic,12",
            "border" : "#ff313539,1",
            "empty" : {
                "borderRight" : "#ff999999,1",
                "paddingRight" : "5",
                "borderBottom" : "#ff999999,1",
                "iconAlignment" : "center",
                "paddingTop" : "2",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "2",
                "contentFit" : "auto",
                "foreground" : "#ff000000",
                "hoveredMaskBackground" : "#1f5292f7",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#1f5292f7",
                "textAlignment" : "center",
                "lineAlignment" : "center",
                "figureBackground" : "#ff008800",
                "paddingLeft" : "2",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "#ffffffff",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12",
                "border" : "#ff313539,1",
            }
        },
        "fixed" : {
            "borderBottom" : "#ffdedede,1",
            "borderRight" : "#ffdedede,1",
            "colBar" : {
                "borderRight" : "#ffd2d9df,1"
            },
            "rowBar" : {
                "borderRight" : "#ffd2d9df,1"
            }
        },
        "header" : {
            "borderRight" : "#ffdedede,1",
            "paddingRight" : "5",
            "borderBottom" : "#ffd2d9df,1",
            "borderTop" : "#ffe7f2fb,0",
            "iconAlignment" : "center",
            "paddingTop" : "8",
            "iconIndex" : "0",
            "iconOffset" : "0",
            "iconLocation" : "left",
            "iconPadding" : "0",
            "paddingBottom" : "8",
            "contentFit" : "auto",
            "foreground" : "#ff4b4b4b",
            "hoveredMaskBackground" : "linear,#ffe7f2fb,#ffe7f2fb,90",
            "selectedForeground" : "#ffffffff",
            "disabledForeground" : "#ff808080",
            "hoveredBackground" : "linear,#ffe7f2fb,#ffe7f2fb,90",
            "textAlignment" : "center",
            "hoveredForeground" : "#ff002f6e",
            "lineAlignment" : "center",
            "figureBackground" : "#ff000000",
            "paddingLeft" : "5",
            "figureInactiveBackground" : "#ffd3d3d3",
            "selectedBackground" : "#ff4c6280",
            "background" : "linear,#ffebeff2,#ffebeff2,90",
            "inactiveBackground" : "#ffd3d3d3",
            "font" : "Nanum Gothic,12,bold",
            "border" : "#ff313539,1",
            "borderLeft" : "#ffebf3fa,0",
            "group" : {
                "borderRight" : "#ffdedede,1",
                "paddingRight" : "5",
                "borderBottom" : "#ffdedede,1",
                "borderTop" : "#ffebf3fa,0",
                "iconAlignment" : "center",
                "paddingTop" : "5",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "5",
                "contentFit" : "auto",
                "foreground" : "#ff4b4b4b",
                "hoveredMaskBackground" : "linear,#fffff8a9,#ffffd75e,90",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "linear,#ffe7f2fb,#ffe7f2fb,90",
                "textAlignment" : "center",
                "hoveredForeground" : "#ff222530",
                "lineAlignment" : "center",
                "figureBackground" : "#ff008800",
                "paddingLeft" : "5",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "linear,#ffebeff2,#ffebeff2,90",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12,bold",
                "border" : "#ff313539,1",
                "borderLeft" : "#ffebf3fa,0"
            }
        },
        "footer" : {
            "borderRight" : "#ff9099a3,1",
            "paddingRight" : "5",
            "borderTop" : "#ff79828b,1",
            "borderBottom" : "#ff808080,1",
            "iconAlignment" : "center",
            "paddingTop" : "5",
            "iconIndex" : "0",
            "iconOffset" : "0",
            "iconLocation" : "left",
            "iconPadding" : "0",
            "paddingBottom" : "4",
            "contentFit" : "auto",
            "foreground" : "#ff000000",
            "hoveredMaskBackground" : "#1f5292f7",
            "selectedForeground" : "#ffffffff",
            "disabledForeground" : "#ff808080",
            "hoveredBackground" : "#1f5292f7",
            "textAlignment" : "near",
            "lineAlignment" : "center",
            "figureBackground" : "#ff008800",
            "paddingLeft" : "5",
            "figureInactiveBackground" : "#ffd3d3d3",
            "selectedBackground" : "#ff696969",
            "background" : "#ffdee2e7",
            "inactiveBackground" : "#ffd3d3d3",
            "font" : "Nanum Gothic,12,bold",
            "border" : "#88888888,1",
        },
        "rowGroup" : {
            "header" : {
                "borderRight" : "#ff85a8d0,1",
                "paddingRight" : "5",
                "borderBottom" : "#ff85a8d0,1",
                "borderTop" : "#ffffffff,1",
                "iconAlignment" : "center",
                "paddingTop" : "8",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "8",
                "contentFit" : "auto",
                "foreground" : "#ff002f6e",
                "hoveredMaskBackground" : "#1f5292f7",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#1f5292f7",
                "textAlignment" : "near",
                "lineAlignment" : "center",
                "figureBackground" : "#ff008800",
                "paddingLeft" : "5",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "linear,#ffebeff2,#ffebeff2,90",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12,bold",
                "border" : "#ff313539,0",
                "borderLeft" : "#ffffffff,1"
            },
            "footer" : {
                "borderRight" : "#ffd8e3f0,1",
                "paddingRight" : "5",
                "borderBottom" : "#ffffffff,0",
                "borderTop" : "#ffd8e3f0,1",
                "iconAlignment" : "center",
                "paddingTop" : "5",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "5",
                "contentFit" : "auto",
                "foreground" : "#ff000000",
                "hoveredMaskBackground" : "#1f5292f7",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#1f5292f7",
                "textAlignment" : "center",
                "lineAlignment" : "center",
                "figureBackground" : "#ff008800",
                "paddingLeft" : "5",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "#ff9cbade",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12,bold",
                "border" : "#ffffffff,0",
                "borderLeft" : "#ffffffff,0"
            },
            "head" : {
                "borderRight" : "#ffd1d1d1,1",
                "paddingRight" : "5",
                "borderBottom" : "#ffd1d1d1,1",
                "borderTop" : "#ffffffff,1",
                "iconAlignment" : "center",
                "paddingTop" : "2",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "2",
                "contentFit" : "auto",
                "foreground" : "#ff002f6e",
                "hoveredMaskBackground" : "linear,#fffff8a9,#ffffd75e,90",
                "selectedForeground" : "#ffff0000",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "linear,#fffff8a9,#ffffd75e,90",
                "textAlignment" : "center",
                "hoveredForeground" : "#ff002f6e",
                "lineAlignment" : "center",
                "figureBackground" : "#ff000000",
                "paddingLeft" : "2",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ffff0000",
                "background" : "linear,#ffebeff2,#ffebeff2,90",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12,bold",
                "border" : "#ff313539,1",
                "borderLeft" : "#ffffffff,1"
            },
            "foot" : {
                "borderRight" : "#ff9099a3,1",
                "borderTop" : "#ff79828b,1",
                "iconAlignment" : "center",
                "paddingTop" : "2",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "1",
                "contentFit" : "auto",
                "foreground" : "#ff000000",
                "hoveredMaskBackground" : "#1f5292f7",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#1f5292f7",
                "textAlignment" : "near",
                "lineAlignment" : "center",
                "figureBackground" : "#ff008800",
                "paddingLeft" : "2",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "#ffdee2e7",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12",
                "border" : "#88888888,1",
            },
            "headerBar" : {
                "borderRight" : "#ffffffff,0",
                "paddingRight" : "5",
                "borderBottom" : "#ffd2d9df,0",
                "borderTop" : "#ffffffff,1",
                "iconAlignment" : "center",
                "paddingTop" : "2",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "2",
                "contentFit" : "auto",
                "foreground" : "#ff002f6e",
                "hoveredMaskBackground" : "#1f5292f7",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#1f5292f7",
                "textAlignment" : "near",
                "lineAlignment" : "center",
                "figureBackground" : "#ff498ee1",
                "paddingLeft" : "2",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "#ffd7e6f7",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12",
                "border" : "#ffffffff,0",
                "borderLeft" : "#ffffffff,1"
            },
            "footerBar" : {
                "borderRight" : "#ffd7e6f7,1",
                "paddingRight" : "5",
                "borderBottom" : "#ffffffff,0",
                "borderTop" : "#ffd7e6f7,1",
                "iconAlignment" : "center",
                "paddingTop" : "2",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "2",
                "contentFit" : "auto",
                "foreground" : "#ff000000",
                "hoveredMaskBackground" : "#1f5292f7",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#1f5292f7",
                "textAlignment" : "near",
                "lineAlignment" : "center",
                "figureBackground" : "#ff008800",
                "paddingLeft" : "2",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "#ff9cbade",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12",
                "border" : "#ffffffff,0",
                "borderLeft" : "#ffffffff,0"
            },
            "bar" : {
                "borderRight" : "#ff85a8d0,1",
                "paddingRight" : "5",
                "borderBottom" : "#ff85a8d0,0",
                "borderTop" : "#ffffffff,0",
                "iconAlignment" : "center",
                "paddingTop" : "2",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "2",
                "contentFit" : "auto",
                "foreground" : "#ff002f6e",
                "hoveredMaskBackground" : "#1f5292f7",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#1f5292f7",
                "textAlignment" : "near",
                "lineAlignment" : "center",
                "figureBackground" : "#ff008800",
                "paddingLeft" : "2",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "#ffd7e6f7",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12",
                "border" : "#ff313539,0",
                "borderLeft" : "#ffffffff,1"
            },
            "panel" : {
                "borderRight" : "#ffd1d1d1,1",
                "paddingRight" : "1",
                "borderBottom" : "#ffd1d1d1,1",
                "borderTop" : "#ffffffff,1",
                "iconAlignment" : "center",
                "paddingTop" : "1",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "1",
                "contentFit" : "auto",
                "foreground" : "#ff002f6e",
                "hoveredMaskBackground" : "#fffff5a2",
                "selectedForeground" : "#ffff0000",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#fffff5a2",
                "textAlignment" : "center",
                "hoveredForeground" : "#ff002f6e",
                "lineAlignment" : "center",
                "figureBackground" : "#ff000000",
                "paddingLeft" : "1",
                "figureInactiveBackground" : "#ffd3d3d3",
                "line" : "#ffd1d1d1,1",
                "selectedBackground" : "#ffff0000",
                "background" : "#ffd7e6f7",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,11",
                "border" : "#ffd1d1d1,1",
                "borderLeft" : "#ffffffff,1"
            }
        },
        "indicator" : {
            "borderRight" : "#ffd2d9df,1",
            "paddingRight" : "2",
            "borderBottom" : "#ffd2d9df,1",
            "borderTop" : "#ffffffff,1",
            "iconAlignment" : "center",
            "paddingTop" : "2",
            "iconIndex" : "0",
            "iconOffset" : "0",
            "iconLocation" : "left",
            "iconPadding" : "0",
            "paddingBottom" : "2",
            "contentFit" : "auto",
            "foreground" : "#ff666666",
            "hoveredMaskBackground" : "#fffff0b2",
            "selectedForeground" : "#ffffffff",
            "disabledForeground" : "#ff808080",
            "hoveredBackground" : "#fffff0b2",
            "textAlignment" : "center",
            "hoveredForeground" : "#ff666666",
            "lineAlignment" : "center",
            "figureBackground" : "#ff1c82ff",
            "paddingLeft" : "2",
            "figureInactiveBackground" : "#ffd3d3d3",
            "selectedBackground" : "#fffff0b2",
            "background" : "#ffebf3fc",
            "inactiveBackground" : "#ffd3d3d3",
            "font" : "Nanum Gothic,11",
            "border" : "#ff313539,1",
            "borderLeft" : "#ffffffff,1",
            "head" : {
                "borderRight" : "#ffdedede,1",
                "paddingRight" : "2",
                "borderBottom" : "#ffd2d9df,1",
                "borderTop" : "#ffffffff,1",
                "iconAlignment" : "center",
                "paddingTop" : "5",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "5",
                "contentFit" : "auto",
                "foreground" : "#ff000000",
                "hoveredMaskBackground" : "#1f5292f7",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#1f5292f7",
                "textAlignment" : "center",
                "hoveredForeground" : "#ffffffff",
                "lineAlignment" : "center",
                "figureBackground" : "#ff008800",
                "paddingLeft" : "2",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "linear,#ffebeff2,#ffebeff2,90",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12",
                "border" : "#ff000000,1",
                "borderLeft" : "#ffffffff,1"
            },
            "foot" : {
                "borderRight" : "#ff9099a3,1",
                "paddingRight" : "2",
                "borderBottom" : "#ff808080,1",
                "borderTop" : "#ff79828b,1",
                "iconAlignment" : "center",
                "paddingTop" : "2",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "2",
                "contentFit" : "auto",
                "foreground" : "#ff000000",
                "hoveredMaskBackground" : "#1f5292f7",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#1f5292f7",
                "textAlignment" : "center",
                "lineAlignment" : "center",
                "figureBackground" : "#ff002f6e",
                "paddingLeft" : "2",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "#ffdee2e7",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12",
                "border" : "#88888888,1",
                "borderLeft" : "#ffffffff,1"
            }
        },
        "checkBar" : {
            "borderRight" : "#ffaab1b8,1",
            "paddingRight" : "2",
            "borderBottom" : "#ffaab1b8,1",
            "iconAlignment" : "center",
            "paddingTop" : "2",
            "iconIndex" : "0",
            "iconOffset" : "0",
            "iconLocation" : "left",
            "iconPadding" : "0",
            "paddingBottom" : "2",
            "contentFit" : "auto",
            "foreground" : "#ff555555",
            "hoveredMaskBackground" : "#1f5292f7",
            "selectedForeground" : "#ffffffff",
            "disabledForeground" : "#ff808080",
            "hoveredBackground" : "#1f5292f7",
            "textAlignment" : "center",
            "lineAlignment" : "center",
            "figureBackground" : "#ff008800",
            "paddingLeft" : "2",
            "figureInactiveBackground" : "#ffd3d3d3",
            "selectedBackground" : "#ff696969",
            "background" : "#ffffffff",
            "inactiveBackground" : "#ffd3d3d3",
            "font" : "Nanum Gothic,12",
            "border" : "#ff313539,1",
            "head" : {
                "borderRight" : "#ffdedede,1",
                "paddingRight" : "2",
                "borderBottom" : "#ffd2d9df,1",
                "borderTop" : "#ffffffff,1",
                "iconAlignment" : "center",
                "paddingTop" : "5",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "5",
                "contentFit" : "auto",
                "foreground" : "#ff000000",
                "hoveredMaskBackground" : "#1f5292f7",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#1f5292f7",
                "textAlignment" : "center",
                "hoveredForeground" : "#ffffffff",
                "lineAlignment" : "center",
                "figureBackground" : "#ff008800",
                "paddingLeft" : "2",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "linear,#ffebeff2,#ffebeff2,90",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12",
                "border" : "#ff000000,0",
                "borderLeft" : "#ffffffff,1"
            },
            "foot" : {
                "borderRight" : "#ff9099a3,1",
                "paddingRight" : "2",
                "borderBottom" : "#ff808080,1",
                "borderTop" : "#ff79828b,1",
                "iconAlignment" : "center",
                "paddingTop" : "2",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "2",
                "contentFit" : "auto",
                "foreground" : "#ff000000",
                "hoveredMaskBackground" : "#1f5292f7",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#1f5292f7",
                "textAlignment" : "center",
                "lineAlignment" : "center",
                "figureBackground" : "#ff008800",
                "paddingLeft" : "2",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "#ffdee2e7",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12",
                "border" : "#88888888,1",
                "borderLeft" : "#ffffffff,1"
            }
        },
        "stateBar" : {
            "borderRight" : "#ffdedede,1",
            "paddingRight" : "2",
            "borderBottom" : "#ffd2d9df,1",
            "iconAlignment" : "center",
            "paddingTop" : "2",
            "iconIndex" : "0",
            "iconOffset" : "0",
            "iconLocation" : "left",
            "iconPadding" : "0",
            "paddingBottom" : "2",
            "contentFit" : "auto",
            "foreground" : "#ff000000",
            "hoveredMaskBackground" : "#1f5292f7",
            "selectedForeground" : "#ffffffff",
            "disabledForeground" : "#ff808080",
            "hoveredBackground" : "#1f5292f7",
            "textAlignment" : "center",
            "lineAlignment" : "center",
            "figureBackground" : "#ff008800",
            "paddingLeft" : "2",
            "figureInactiveBackground" : "#ffd3d3d3",
            "selectedBackground" : "#ff696969",
            "background" : "#ffffffff",
            "inactiveBackground" : "#ffd3d3d3",
            "font" : "Nanum Gothic,12",
            "border" : "#ff313539,1",
            "head" : {
                "borderRight" : "#ffdedede,1",
                "paddingRight" : "2",
                "borderBottom" : "#ffd2d9df,1",
                "borderTop" : "#ffffffff,1",
                "iconAlignment" : "center",
                "paddingTop" : "5",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "5",
                "contentFit" : "auto",
                "foreground" : "#ff000000",
                "hoveredMaskBackground" : "#1f5292f7",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#1f5292f7",
                "textAlignment" : "center",
                "hoveredForeground" : "#ffffffff",
                "lineAlignment" : "center",
                "figureBackground" : "#ff008800",
                "paddingLeft" : "2",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "linear,#ffebeff2,#ffebeff2,90",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12",
                "border" : "#ff000000,0",
                "borderLeft" : "#ffffffff,1"
            },
            "foot" : {
                "borderRight" : "#ff9099a3,1",
                "paddingRight" : "2",
                "borderBottom" : "#ff808080,1",
                "borderTop" : "#ff79828b,1",
                "iconAlignment" : "center",
                "paddingTop" : "2",
                "iconIndex" : "0",
                "iconOffset" : "0",
                "iconLocation" : "left",
                "iconPadding" : "0",
                "paddingBottom" : "2",
                "contentFit" : "auto",
                "foreground" : "#ff000000",
                "hoveredMaskBackground" : "#1f5292f7",
                "selectedForeground" : "#ffffffff",
                "disabledForeground" : "#ff808080",
                "hoveredBackground" : "#1f5292f7",
                "textAlignment" : "center",
                "lineAlignment" : "center",
                "figureBackground" : "#ff008800",
                "paddingLeft" : "2",
                "figureInactiveBackground" : "#ffd3d3d3",
                "selectedBackground" : "#ff696969",
                "background" : "#ffdee2e7",
                "inactiveBackground" : "#ffd3d3d3",
                "font" : "Nanum Gothic,12",
                "border" : "#88888888,1",
                "borderLeft" : "#ffffffff,1"
            }
        },
        "selection" : {
            "paddingRight" : "0",
            "iconAlignment" : "center",
            "paddingTop" : "0",
            "iconIndex" : "0",
            "iconOffset" : "0",
            "iconLocation" : "left",
            "iconPadding" : "0",
            "paddingBottom" : "0",
            "contentFit" : "auto",
            "foreground" : "#ff000000",
            "hoveredMaskBackground" : "#1f5292f7",
            "selectedForeground" : "#ffffffff",
            "disabledForeground" : "#ff808080",
            "hoveredBackground" : "#1f5292f7",
            "textAlignment" : "center",
            "lineAlignment" : "center",
            "figureBackground" : "#ff008800",
            "paddingLeft" : "0",
            "figureInactiveBackground" : "#ffd3d3d3",
            "selectedBackground" : "#ff696969",
            "background" : "#2f1e90ff",
            "inactiveBackground" : "#ffd3d3d3",
            "font" : ",12",
            "border" : "#2f1e90ff,0",
        }
    };
    return styles;
}


/**
 * toolbar object
 */
function gridbarObject(p_tabId, p_gridObj, p_option){
    var __settings = {
        tooltip : true,
        readOnly : false,       //EditOptions.readOnly 
        add : true,             //EditOptions.appendable 
        insert : false,         //EditOptions.insertable
        copy : false,           //
        remove : true,          //EditOptions.deletable 
        excel : false,
        expand : false,
        gridView : undefined,
        dataProvider : undefined,
        columns : undefined,
        fields : undefined,
        showStateBar : true,
        showCheckBar : true,
        fixedOption : undefined,
        onCellEdited : null,            //function (grid, itemIndex, dataRow, field)
        onCellButtonClicked : null,     //function (grid, itemIndex, column)
        onCopied : null,                //function (dataProvider, gridView, newItemIndex) {}
        copyExceptFields : undefined    //[]
    };
    $.extend(true, __settings, p_option);  
    
    var __tabId = p_tabId;
    var __guId = nextbi.common.utils.getGUID();

    this.getSetting = function (){
        return __settings;
    }
    this.setSetting = function (p_option){
        $.extend(true, __settings, p_option);
        __init();
        __setEvent();
        __tooltips();
    }
    var __init = function (){
        var num = 0;
        var innerHTML = [];  
        if (!__settings.readOnly) {
            if (__settings.add)
                innerHTML[num++] = '<a href="javascript:;" id="gridbar_btn_add_' + __guId + '" class="btn tooltips nui-gridbar-append" title="Append"><i class="fa fa-plus-square "></i></a>';

            if (__settings.insert)
                innerHTML[num++] = '<a href="javascript:;" id="gridbar_btn_insert_' + __guId + '" class="btn tooltips nui-gridbar-add" title="Add"><i class="fa fa-plus"></i></a>';

            if (__settings.copy)
                innerHTML[num++] = '<a href="javascript:;" id="gridbar_btn_copy_' + __guId + '" class="btn tooltips nui-gridbar-copy" title="Copy"><i class="fa fa-clipboard "></i></a>';

            if (__settings.remove)
                innerHTML[num++] = '<a href="javascript:;" id="gridbar_btn_remove_' + __guId + '" class="btn tooltips nui-gridbar-remove" title="Remove"><i class="fa fa-trash"></i></a>';
        }
        
        if (__settings.excel)
            innerHTML[num++] = '<a href="javascript:;" id="gridbar_btn_excel_' + __guId + '" class="btn tooltips nui-gridbar-excel" title="Excel"><i class="fa fa-file-excel-o"></i></a>';

        if (__settings.expand)
            innerHTML[num++] = '<a href="javascript:;" id="gridbar_btn_expand_' + __guId + '" class="btn tooltips fullscreen" title="Expand"><i class="fa fa-expand"></i></a>';
    
        var html = "";  
        if(!nextbi.common.utils.isNull(innerHTML) && innerHTML.length > 0){ 
            html = innerHTML.join("").toString();
        }
        p_gridObj.closest('.grid-view').prev().find(".btn-icon").append(html);   
        p_gridObj.data('gridHeight', p_gridObj.css("height"));
        p_gridObj.data('gridView', __settings.gridView);  
        
        if (!__settings.gridView) {
            $.error({ title: "Error", content: "뷰가 정의되지 않았습니다." });
            return;
        }

        if (!__settings.dataProvider) {
            $.error({ title: "Error", content : "데이터 프로바이더가 정의되지 않았습니다." });
            return;
        }

        if (!__settings.columns) {
            $.error({ title: "Error", content : "컬럼이 정의되지 않았습니다." });
            return;
        }

        if (!__settings.fields) {
            $.error({ title: "Error", content : "필드가 정의되지 않았습니다." });
            return;
        }

        /**
         * 이벤트가 충돌되어 onCellEdited, onCellButtonClicked 이벤트를 호출될 때 개발자가 별도의 함수를 정의하여 처리하도록 하기 위한
         * 함수 정의
         */
        p_gridObj.data("defaultOnCellEdited", __settings.onCellEdited);
        p_gridObj.data("defaultOnCellButtonClicked", __settings.onCellButtonClicked);
        if (typeof(__settings.onCellEdited) == "function" && __settings.onCellEdited != null) {
            __settings.gridView.onCellEdited = function (grid, itemIndex, dataRow, field) {
                __settings.onCellEdited(grid, itemIndex, dataRow, field);
            }
        }
        if (typeof(__settings.onCellButtonClicked) == "function" && __settings.onCellButtonClicked != null) {
            __settings.gridView.onCellButtonClicked = function (grid, itemIndex, column) {
                __settings.onCellButtonClicked(grid, itemIndex, column);
            }
        }
        
        if (__gridDpArray[__tabId])
            var _gridDp = __gridDpArray[__tabId];
        else
            var _gridDp = {};
        
        _gridDp[__guId] = __settings.dataProvider;
        
        __gridDpArray[__tabId] = _gridDp;
        
        __settings.gridView.setDataSource(__settings.dataProvider);
        
        __settings.gridView.setOptions({
            edit : {
                readOnly : __settings.readOnly,
                editable : !__settings.readOnly,
                insertable : __settings.insert,
                appendable : __settings.add,
                deletable : __settings.remove,
                deleteRowsConfirm : false,
            },
            stateBar : {
                visible : !__settings.readOnly && __settings.showStateBar
            },
            checkBar : {
                visible : __settings.showCheckBar
            },
            panel : {
                visible : false
            },
            display : {
                focusActiveColor : 0x5292f7
            }
        });
        
        __settings.gridView.setColumns(__settings.columns);

        __settings.gridView.setDisplayOptions({ 
            fitStyle : 'even',
        });
        
        __settings.gridView.setHeader({
            showTooltip: true  //Grid Header 툴팁 적용  
        });
        
        __settings.gridView.setEditOptions({
            crossWhenExitLast : true,
            checkDiff : true
        });
        
        if (__settings.fixedOption) {
            var fixedOptionDefault = {
                    colBarWidth : 1,
                    rowBarHeight : 1,
                    resizable : true,
                    editable : true,
                    movable : true,
            };
        
            $.extend(fixedOptionDefault, __settings.fixedOption);
            __settings.gridView.setFixedOptions(fixedOptionDefault);
        }
        
        // NextERP 그리드 스타일 적용
        __settings.gridView.setStyles(getGridStyles());

        // NextERP 셀 스타일 적용
        __settings.gridView.addCellStyle("required", {
            "background" : "#fff9cd",
            "foreground" : "#333333",
            "readOnly" : false,
            "editable" : true
        }, true);

        __settings.gridView.addCellStyle("normal", {
            "background" : "#ffffff",
            "foreground" : "#333333",
            "readOnly" : false,
            "editable" : true
        }, true);

        __settings.gridView.addCellStyle("disabled", {
            "background" : "#f6f6f6",
            "foreground" : "#333333",
            "readOnly" : true,
            "editable" : false
        }, true);

        __settings.gridView.addCellStyle("amtDecimal0", {
            "numberFormat" : "#,###"
        }, true);

        __settings.gridView.addCellStyle("amtDecimal1", {
            "numberFormat" : "#,###.0"
        }, true);

        __settings.gridView.addCellStyle("amtDecimal2", {
            "numberFormat" : "#,###.00"
        }, true);

        __settings.gridView.addCellStyle("amtDecimal3", {
            "numberFormat" : "#,###.000"
        }, true);

        __settings.gridView.addCellStyle("amtDecimal4", {
            "numberFormat" : "#,###.0000"
        }, true);

        __settings.dataProvider.setFields(__settings.fields);
        
        //그리드 옵션
        __settings.dataProvider.setOptions({
            heightMeasurer: "default",  
            softDeleting : true,  
            commitBeforeDataEdit : true //행 편집 상태에서 다른 행의 값을 변경할 경우 종전에 "client is editing" 메세지가 표시되는것을 방지하기 위해 편집중일때 grid.setValue, dataProvider.setValue를 하는 경우 편집 중인 행을 commit시킨다.
        });
        
        //Grid 붙여넣기 옵션
        __settings.gridView.setPasteOptions({              
            selectionBase: true        //붙여넣기 시작 위치를 지정한다. true면 focus 셀이 포함된 선택 영역의 처음 셀부터 붙여넣기 합니다. false면 focus 셀 부터 붙여넣기 한다. 기본값은 false.
            , checkReadOnly: true      //true면 readOnly이거나 editable이 false인 Column은 paste대상에서 제외됩니다. 기본값은 false. 
            , noEditEvent: true          //true면 단일행을 붙여넣기 할때 Cell마다 발생하는 onEditRowChanged가 발생하지 않는다. onEditRowPasted는 noEditEvent과 무관하게 항상 발생한다. 기본값은 false.
            , eventEachRow : true       //true면 복수행을 붙여넣기 할때 각 행마다 onEditRowPasted이벤트가 발생합니다. 이 속성과 관계없이 onRowsPasted이벤트는 발생합니다. 기본값은 false.
            , fillFieldDefaults:true 
            , fillColumnDefaults:true 
        });
        
        //탭 클릭 시 Grid 갱신하기
        $("#tabMenuContentDiv").find("li.tabMenu").find("a").unbind("click").bind("click", function(e){       
            var $this = $(this);
            var href = $this.prop("href");
            var id = href.substring(href.indexOf("#tab_"), href.length);  
            var $gridDiv = $(id).find("div.grid-view").find("div[id $= '" + id.replace("#tab_", "") + "']"); 
            setTimeout(function(){   
                $.each($gridDiv, function(){
                    var id = this.id;
                    var $grid = $("#" + id);
                    var gridView = $grid.data("gridView");
                    var gridHeight = $grid.data("gridHeight");
                    $grid.css("height", gridHeight);  
                    if($.type(gridView) == "object") {
                        gridView.resetSize();
                    }
                });   
            }, 100);       
            
            e.preventDefault();
        });   
    }

    var __setEvent = function (){
        if (!__settings.readOnly && __settings.add) {
            $("#gridbar_btn_add_" + __guId).unbind("click").bind("click", function(e) {
                __settings.gridView.beginAppendRow();
                __settings.gridView.showEditor();
                __settings.gridView.setFocus();
                __settings.gridView.commit(true);
                e.preventDefault();
            });
        }
        if (!__settings.readOnly && __settings.insert) {
            $("#gridbar_btn_insert_" + __guId).unbind("click").bind("click", function(e) {
                var _curr = __settings.gridView.getCurrent();
                __settings.gridView.beginInsertRow(Math.max(0, _curr.itemIndex));
                __settings.gridView.showEditor();
                __settings.gridView.setFocus();
                __settings.gridView.commit(true);
                e.preventDefault();
            });
        }
        if (!__settings.readOnly && __settings.copy) {
            $("#gridbar_btn_copy_" + __guId).unbind("click").bind("click", function(e) {
                var _dataRow = __settings.gridView.getCurrent().dataRow;
                if (_dataRow == -1) return;
                __settings.gridView.commit();
                var _jsonData = __settings.dataProvider.getJsonRow(_dataRow);
                if (__settings.copyExceptFields) {
                    for (var i in __settings.copyExceptFields) {
                        _jsonData[__settings.copyExceptFields[i]] = null;
                    }
                }
                if (__settings.dataProvider.getRowCount() == _dataRow + 1) {
                    __settings.dataProvider.addRow(_jsonData);
                } else {
                    __settings.dataProvider.insertRow(_dataRow+1, _jsonData);
                }
                if(typeof(__settings.onCopied) == "function") {
                    __settings.onCopied(__settings.dataProvider, __settings.gridView, _dataRow + 1); 
                }
                e.preventDefault();
            });
        }
        if (!__settings.readOnly && __settings.remove) {
            $("#gridbar_btn_remove_" + __guId).unbind("click").bind("click", function(e) {
                var _rows = __settings.gridView.getCheckedRows(true);
                var _rowsLen = _rows.length;
                if (_rowsLen > 0) {
                    for (var i = _rowsLen - 1; i >= 0; i--) {
                        var _rowId = _rows[i]; 
                        var state = __settings.dataProvider.getRowState(_rowId); 
                        if($.trim(state) == "created"){
                            __settings.dataProvider.setOptions({softDeleting: false}); //DataProvider 에서 데이터 실제 삭제
                        }else{
                            __settings.dataProvider.setOptions({softDeleting: true}); ///DataProvider 에서 데이터 실제로 삭제되지 않고 rowState만 변경된다. 
                        }
                        __settings.dataProvider.removeRow(_rowId);
                    }
                } else {
                    var _itemIndex = __settings.gridView.getCurrent().itemIndex;
                    var _rowId = __settings.gridView.getDataRow(_itemIndex);
                    var state = __settings.dataProvider.getRowState(_rowId);
                    
                    if($.trim(state) == "created"){
                        __settings.dataProvider.setOptions({softDeleting: false}); //DataProvider 에서 데이터 실제 삭제
                        __settings.dataProvider.removeRow(_rowId);
                    }else{
                        __settings.dataProvider.setOptions({softDeleting: true}); ///DataProvider 에서 데이터 실제로 삭제되지 않고 rowState만 변경된다.
                        __settings.gridView.deleteSelection();  
                    }
                }
                e.preventDefault();
            });
        }
        if (__settings.excel) {
            $("#gridbar_btn_excel_" + __guId).unbind("click").bind("click", function(e) {
                var $this = $(this);
                var optionType = $this.attr("optiontype");
                if (nextbi.common.utils.isNull(optionType)) {
                    optionType = "default";
                }
                var title = $this.parent().parent().parent().find(".caption-subject").text();
                if (!nextbi.common.utils.isNull(title)) {
                    title = title + "(" + nextbi.common.utils.getSysDate("") + ").xlsx";
                }else{
                    var $tabContent = $this.closest("div[tab-id]");   
                    var titleClone = $tabContent.find(".page-title").clone();  
                    titleClone.find("i").remove(); 
                    title = $.trim(titleClone.text()) + "(" + nextbi.common.utils.getSysDate("") + ").xlsx";
                }   
                /**
                $.nui.modal.confirm({  
                    title: "Confirm",
                    content: $.nui.core.uiLabel.CMNMessageUiLabels["Common.message.excelExport"], //엑셀을 Export 하시겠습니까?  
                    confirm: function() { 
                        __settings.gridView.exportGrid({
                            type : "excel",
                            target : "local",
                            fileName : title,
                            showProgress: true, 
                            indicator : optionType,
                            header : optionType,  
                            footer : optionType,
                            lookupDisplay : true,
                            compatibility : true,
                            allItems : true
                            //default : 그리드에 표시된 상태면 출력에도 포함 시킨다.
                            //visible : 그리드 상태와 상관없이 항상 출력에 포함 시킨다.
                            //hidden  : 그리드 상태와 상관없이 출력에 포함 시키지 않는다.
                        });  
                    },
                    cancel: function() {
                    	//
                    }
                    
                }); 
                */ 
                e.preventDefault();
            });
        }
        if (__settings.expand) {
            var beforeGridHeight = 0;
            $("#gridbar_btn_expand_" + __guId).unbind("click").bind("click", function(e) {
                preventResise = true;
                e.preventDefault();
                var portlet = $(this).closest(".portlet");

                if (portlet.hasClass('portlet-fullscreen')) {
                    $(this).parents('.portlet-fullscreen').find('.grid-view > div[id*="Grid"]').height(beforeGridHeight);
                    $(this).removeClass('on');
                    portlet.removeClass('portlet-fullscreen');
                    $('body').removeClass('page-portlet-fullscreen');
                    __settings.gridView.resetSize();
                } else {
                    var height = NextERP.getViewPort().height -
                        portlet.children('.portlet-title').outerHeight() -
                        parseInt(portlet.children('.portlet-body').css('padding-top')) -
                        parseInt(portlet.children('.portlet-body').css('padding-bottom'));

                    $(this).addClass('on');
                    portlet.addClass('portlet-fullscreen');
                    $('body').addClass('page-portlet-fullscreen');
                    beforeGridHeight = $(this).parents('.portlet-fullscreen').find('.grid-view > div[id*="Grid"]').height();
                    $(this).parents('.portlet-fullscreen').find('.grid-view > div[id*="Grid"]').height(height);
                    gridView = $(this).parents('.portlet-fullscreen').find('.grid-view > div[id*="Grid"]').data('gridView')
                    __settings.gridView.resetSize();
                }
            });
        }
    }
    
    var __tooltips = function() {
        if(__settings.tooltip){
         // global tooltips
            $('.tooltips', __tabId).tooltip();
        }
    };
        
    __init();
    __setEvent();
    __tooltips();
}