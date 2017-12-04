<?php
//api uses the "leaky bucket" throttling method, to minimize api spam
class Api {
	
	const RESPONSECODE_EMPTY	= 204;
	const RESPONSECODE_OK		= 200;
	const RESPONSECODE_LOST		= 404;
	const RESPONSECODE_PERM		= 401;
	const RESPONSECODE_OFFLINE	= 503;
	const API_LIMIT				= 550; //without user requests, just open browser the user will have 337.5 automatic requests each 900 seconds (getfriends+getrequests) (1 minutes). 450 ensures a buffer for reloads and self requests
	const API_TIME				= 900; //900 seconds == 15 minutes

	public function __construct() {
		global $table_prefixm, $devmode;
		if($devmode)
			error_reporting(E_ALL);
		else
			error_reporting(0);
		
		ini_set('max_execution_time', '600'); //10 minutes
	
		$this->API		= array();
		$this->db		= New Database;
		$this->missing	= '';
	}
	
	public function ProcessRequest($requestData) {
		global $offline, $login, $table_prefix;

		//Output default is json
		$this->API['output'] = !empty($requestData['output']) ? $requestData['output'] : 'json';
		if(!isset($login->user->data['user_id']))
			die(json_encode(array('status' => 401)));

		$s_last_apiCall = $this->db->query("SELECT `last_apiCall` AS result FROM `".friendsTable."` WHERE `user_id` = '{$login->user->data['user_id']}'");
		if(!$this->db->rows($s_last_apiCall))
			$this->db->query("INSERT INTO `".friendsTable."` SET `user_id` = '{$login->user->data['user_id']}'");
		else
			 $last_apiCall = json_decode($this->db->fetch($s_last_apiCall), true);

		if(!isset($last_apiCall) or !is_array($last_apiCall))
			$last_apiCall = array('time' => 0, 'throttle' => 0);

		if(!isset($last_apiCall['throttle']))
			$last_apiCall['throttle'] = 0;

		if(!isset($last_apiCall['last']))
			$last_apiCall['last'] = 0;

		$last_api_diff = time() - $last_apiCall['last']; # in seconds
		$minute_throttle = $last_apiCall['throttle']; # get from the DB
		if ( is_null( self::API_LIMIT ) ) {

		    $new_minute_throttle = 0;
		
		} else {
		    
		    $new_minute_throttle = $minute_throttle - $last_api_diff;
		    $new_minute_throttle = $new_minute_throttle < 0 ? 0 : $new_minute_throttle;
		    $new_minute_throttle +=	self::API_TIME / self::API_LIMIT;
		    $minute_hits_remaining = floor( ( self::API_TIME - $new_minute_throttle ) * self::API_LIMIT / self::API_TIME  );
		    # can output this value with the request if desired:
		    $minute_hits_remaining = $minute_hits_remaining >= 0 ? $minute_hits_remaining : 0;
		
		}

		if ( $new_minute_throttle > self::API_TIME ) {
		
			$wait = ceil( $new_minute_throttle - self::API_TIME );
			usleep( 250000 );
			$this->API['status'] = self::RESPONSECODE_OFFLINE;
			$this->API['result'] = 'Overload, too many requests per second. Please do not spam our service. '.$wait.' seconds before attempting again.';
		
		} else {

			$last_apiCall = json_encode(array('last' => time(), 'throttle' => $new_minute_throttle));
			$this->db->query("UPDATE `".friendsTable."` SET
														`last_apiCall` = '{$last_apiCall}'
														WHERE `user_id` = '{$login->user->data['user_id']}'");

			//The server successfully processed the request, but is not returning any content.[2] Usually used as a response to a successful delete request. 
			$this->API['status']	= self::RESPONSECODE_EMPTY;
			
			//Check if handle is sent
			$this->API['result']	= empty($requestData['handle']) ?  'Handle not found' : 'null';
			
			if(!isset($requestData['handle']))
				$requestData['handle'] = null;
			
			//Prepare $requestData
			$requestData			= $this->db->prepare($requestData);
			
			//Set api response
			!empty($requestData['handle']) && $offline == false ? $this->GetApiResponse($requestData) : false;
		}

		//Debug
		//$this->API['DEBUG']['requestData'] = $requestData;
		//$this->API['DEBUG']['user'] = $login->user->data;
		
		//Set header to status
		//http_response_code(404);
		
		//print data
		switch($this->API['output']){
			
			/* !OUTPUT: HTML */
			case 'html':
			
				echo !empty($this->API['status']) ? $this->API['status'] : debug($this->API);
			
			break;
			
			/* !OUTPUT: none */
			case 'none':
			
				return true;
			
			break;
			
			/* !OUTPUT: json */
			case 'json':
			
				header('Content-Type: application/json');
				$this->API['handle'] = $requestData['handle'];
				
				if (!empty($requestData['table'])) {
					$this->API['table'] = $requestData['table'];
				}
				
				unset($this->API['output']);
				
				echo json_encode($this->API);
			
			break;
			
			/* !OUTPUT: jsonOnlyResult */
			case 'jsonOnlyResult':
			
				header('Content-Type: application/json');
				
				echo $this->API['status'] == true ? json_encode($this->API['result']) : json_encode($this->API);
			
			break;
			
			/* !OUTPUT: default (json) */
			default:
			
				header('Content-Type: application/json');
				unset($this->API['output']);
				echo json_encode($this->API);
			
			break;
		}

	}
	
	private function GetApiResponse($requestData) {
		global	$login;

		if(!$this->requires( array('session' => $login->CheckLoggedIn(false) ) )) {
		
			$this->API['status']	= self::RESPONSECODE_PERM;
			$this->API['result']	= 'Missing: '.$this->missing;
			return;
		
		}

		
		switch($requestData['handle']) {
			
			/* !API: login */
			case 'getFriends':

				$this->getFriends		= new getFriends;
				$friendsData = $this->getFriends->retrieve();

				if(empty($friendsData)) {
					$this->API['status']	= self::RESPONSECODE_EMPTY;
					$this->API['result']	= 'No friends';
					continue;
				}

				$this->API['status']	= self::RESPONSECODE_OK;
				$this->API['result']	= $friendsData;
			break;

			case 'searchFriend':

				if(!$this->requires( array('query' => $requestData['query'] ) )) {
				
					$this->API['status']	= self::RESPONSECODE_EMPTY;
					$this->API['result']	= 'Missing: '.$this->missing;
					continue;
				
				}
				
				$this->getFriends		= new getFriends;
				$friendsData = $this->getFriends->search($requestData['query']);

				if(empty($friendsData)) {
					$this->API['status']	= self::RESPONSECODE_EMPTY;
					$this->API['result']	= 'No results';
					continue;
				}

				$this->API['status']	= self::RESPONSECODE_OK;
				$this->API['result']	= $friendsData;
			break;

			case 'inviteFriend':
				if(!$this->requires( array('id' => $requestData['id'] ) )) {
				
					$this->API['status']	= self::RESPONSECODE_EMPTY;
					$this->API['result']	= 'Missing: '.$this->missing;
					continue;
				
				}

				$this->inviteFriends		= new inviteFriends;
				$this->API['status']		= $this->inviteFriends->request($requestData['id']);
				unset($this->API['result']);
			break;

			case 'inviteFriendInGame':
			case 'inviteFriendByUsername':
				if(!$this->requires( array('username' => $requestData['username'] ) )) {
				
					$this->API['status']	= self::RESPONSECODE_EMPTY;
					$this->API['result']	= 'Missing: '.$this->missing;
					continue;
				
				}
				$this->getFriends			= new getFriends;
				$this->inviteFriends		= new inviteFriends;
				$this->API['userData']		= $this->getFriends->finduserID($requestData['username']);
				
				if($this->API['userData']['user_id'] == 0)
					$this->API['status']		= 0;
				else
					$this->API['status']		= $this->inviteFriends->request($this->API['userData']['user_id']);

				unset($this->API['result']);
			break;

			case 'getRequests':
				$this->inviteFriends		= new inviteFriends;
				$this->API['status']		= self::RESPONSECODE_OK;
				$this->API['result']		= $this->inviteFriends->getRequests();
			break;

			case 'respondRequest':
				if(!$this->requires( array('from' => $requestData['from'], 'answer' => $requestData['answer'] ) )) {
				
					$this->API['status']	= self::RESPONSECODE_EMPTY;
					$this->API['result']	= 'Missing: '.$this->missing;
					continue;
				
				}

				$this->inviteFriends		= new inviteFriends;
				$this->API['status']		= self::RESPONSECODE_OK;
				$this->API['result']		= $this->inviteFriends->respondRequest($requestData['from'], $requestData['answer']);
			break;

			case 'unfriend':
				if(!$this->requires( array('id' => $requestData['id'] ) )) {
				
					$this->API['status']	= self::RESPONSECODE_EMPTY;
					$this->API['result']	= 'Missing: '.$this->missing;
					continue;
				
				}

				$this->inviteFriends		= new inviteFriends;
				$this->API['status']		= self::RESPONSECODE_OK;
				$this->API['result']		= $this->inviteFriends->unfriend($requestData['id']);
			break;
			
			/* !API: default(RESPONSECODE_LOST) */
			default:
			
				$this->API['status']	= self::RESPONSECODE_LOST;
				$this->API['result'] 	= 'Handle not found';
			
			break;
			
		}
	
	}
	
	//!HELPERS
	private function requires($array) {
		
		foreach($array as $key => $variable) {
			
			if($variable == true)
				continue;
			
			if($variable == '' || strlen(trim($variable)) == 0 || $variable == 'null' || $variable == 'undefined' || $variable == '-1') {
							
				$this->missing .= $key.' ';
				
			}
		
		}
		
		return empty($this->missing) ? true : false;
		
	}

}

?>