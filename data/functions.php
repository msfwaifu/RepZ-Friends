<?php

	function debug($variable, $output = true){
	
		$return = '';
		
		$return .= '<pre style="z-index: 99999;position: relative;display: block;padding: 9.5px;margin: 0 0 10px;font-size: 13px;line-height: 1.428571429;color: #333333;word-break: break-all;word-wrap: break-word;background-color: #f5f5f5;border: 1px solid #cccccc;border-radius: 4px;">';
		if(is_array($variable)) {
		
			$return .= print_r($variable, true);
		
		} else {
			
			$return .= var_export($variable, true);
		
		}
		$return .= '</pre>';
		
		if($output == false) {
		
			return $return;
		
		} else {
		
			echo $return;
		
		}
	}

	function inputVal($name, $defVal = '', $dbData = '', $postData = '') {
		global ${$dbData}, ${$postData};
		
		if(isset(${$dbData}) && is_array(${$dbData})) {
			$dbData = ${$dbData};
		} else {
			$dbData = array();
		}
		
		if(isset(${$postData}) && is_array(${$postData})) {
			$postData = ${$postData};
		} else {
			$postData = $_POST;
		}
			
		if(count($postData) == 0)
			$postData = $_POST;
		
		//if name is array
		if (strpos($name,'[') !== false) {
			
			$arraydephs = explode('[', str_replace(']', '', $name) );
			$build = '';
			foreach($arraydephs as $arraydeph){
				if(!empty($arraydeph))
					$build .= "['$arraydeph']";
			}
			return eval('	if(!empty($postData'.$build.'))
								return $postData'.$build.';
							
							if(!empty($dbData'.$build.'))
								return $dbData'.$build.';
								
							if(isset($postData'.$build.'))
								return $postData'.$build.';
							
							if(isset($dbData'.$build.'))
								return $dbData'.$build.';
							
							return "'.$defVal.'";');
			
		
		}
		
		if(!empty($postData[$name]))
			return $postData[$name];

		if(!empty($dbData[$name]))
			return $dbData[$name];
			
		if(isset($postData[$name]))
			return $postData[$name];

		if(isset($dbData[$name]))
			return $dbData[$name];
			
		return $defVal;
	}
?>