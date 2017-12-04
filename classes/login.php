<?php
	/**
	 * Simple login class made with the PHPBB3 specs, by Iain Munro
	 */
	class Login {
		
		private $db;
		public $user;
		public $auth;
			
		public function __construct() {
			global $user, $auth, $config;
			$this->db = New Database;
			$this->user = $user;
			$this->auth = $auth;
			
			// Start session management

			//if posted sid, use that (game client will use this) also sometimes in browsers like firefox this is needed
			parse_str(parse_url($_SERVER['HTTP_REFERER'], PHP_URL_QUERY), $HTTP_REFERER_GETS);
			if(isset($_GET['sid']) || isset($HTTP_REFERER_GETS['sid'])) {
				
				$sid = isset($HTTP_REFERER_GETS['sid']) ? $HTTP_REFERER_GETS['sid'] : $_GET['sid'];

				unset($_COOKIE[$config['cookie_name'].'_u']);
				unset($_COOKIE[$config['cookie_name'].'_k']);
				unset($_COOKIE[$config['cookie_name'].'_sid']);
				$this->user->set_cookie('sid', $sid , time() + 31536000);
				$_COOKIE[$config['cookie_name'] . '_sid'] = $sid;

				//since our ssid is being used for the api the referer check will always return false, lets turn it off in order for this to work
				//same goes for some other stuff that won't work with this methode.
				$config['referer_validation'] = false;
				$config['browser_check'] = false;
				$config['forwarded_for_check'] = false;

			}
			$this->user->session_begin();
			$this->auth->acl($this->user->data);
			$this->user->setup();

			//remove anyon requests
			if(empty($this->user->data['user_id']) || $this->user->data['user_id'] == ANONYMOUS)
				die(json_encode(array('status' => 401)));
		}
			
		public function AttemptLogin() {
			//Clean user posted data
			$_POST = $this->db->prepare($_POST);

			if(!isset($_POST['username']) || !isset($_POST['password']))
				return $this->user->lang['LOGIN_ERROR_USERNAME'];

			$result = $this->auth->login(request_var('username', $_POST['username']), request_var('password', $_POST['password']), true);
			if($result['status'] != LOGIN_SUCCESS)
				return $this->user->lang[$result['error_msg']];

			if(empty($this->user->data['group_id']) or $this->user->data['group_id'] <= 1) {
				$this->Logout();
				return "Sorry, this user is not a staff member.";
			}

			header("Location: ".DOMAIN_NAME."");
		}
		
		public function Logout() {

			$this->user->session_kill();
			header("Location: ".DOMAIN_NAME);		
			return false;

		}

		public function CheckLoggedIn($output = true) {

			if(empty($this->user->data['group_id']) or $this->user->data['group_id'] <= 1)
				return $output ? $this->Logout() : false;

			if(empty($this->user->data['user_id']) or $this->user->data['user_id'] <= 1)
				return $output ? $this->Logout() : false;
				
			if(basename($_SERVER['REQUEST_URI']) == 'login.php')
				return $output ? header("Location: ".DOMAIN_NAME.'') : true;
				
			return true;
		}
}