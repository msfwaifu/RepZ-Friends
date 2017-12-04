<?php
	/**
	 * Class for getting account friends but also searching for friends and other related functions
	 */
	class getFriends {
		
		private $db;
			
		public function __construct() {

			$this->db = New Database;

		}
			
		public function retrieve() {
			
			global $table_prefix, $login;
			$friendData = $this->db->fetch($this->db->query("SELECT * FROM `".friendsTable."` 
																	WHERE `user_id` = '{$login->user->data['user_id']}'"));
			
			$s_friendsData = "SELECT `{$table_prefix}users`.`user_id`, `{$table_prefix}users`.`username`, `{$table_prefix}users`.`user_avatar`, `{$table_prefix}users`.`user_avatar_type`, `{$table_prefix}users`.`user_ip`, `".friendsTable."`.`isonline`, `".friendsTable."`.`current_server`, `".friendsTable."`.`hostname` FROM `{$table_prefix}users` ";
			$s_friendsData .= "LEFT JOIN `".friendsTable."` ON `{$table_prefix}users`.`user_id` = `".friendsTable."`.`user_id` ";

			$friendData['friends_ids'] = explode(',', $friendData['friends_ids']);
			foreach($friendData['friends_ids'] as $index => $friend) {

				if($index == 0)
					$s_friendsData .= "WHERE `{$table_prefix}users`.`user_id` = '$friend' ";
				else
					$s_friendsData .= "OR `{$table_prefix}users`.`user_id` = '$friend' ";
			}
			$s_friendsData .= "AND `{$table_prefix}users`.`user_type` != 2 ";

			//order by and limit
			$s_friendsData .= "ORDER BY `".friendsTable."`.`current_server` != '' DESC, `".friendsTable."`.`current_server` != '0.0.0.0' DESC, `".friendsTable."`.`current_server` != 'none' DESC, `".friendsTable."`.`isonline` = 1 DESC, `{$table_prefix}users`.`user_avatar` DESC LIMIT 500";
			$friendsData = array();
			foreach($this->db->fetchAll($this->db->query($s_friendsData)) as $friend) {
				if(empty($friend))
					continue;
				$friend['avatar'] = $this->getAvatar($friend['user_avatar'], $friend['user_avatar_type']);
				$friend['current_server'] = $this->parseServerIP($friend['current_server'], $friend['user_ip']);
				unset($friend['user_ip']);

				//later clan member etc
				$friend['friend'] = in_array($friend['user_id'], $friendData['friends_ids']);

				//if he's a friend prepend him to the top of our list
				if($friend['friend'])
					array_unshift($formattedFriends, $friend);
				else
					$formattedFriends[] = $friend;

				$friendsData[] = $friend;
			}
			return $friendsData;
		}

		public function search($query) {
			global $table_prefix, $login;
			$friends = $this->db->fetchAll($this->db->query("SELECT `{$table_prefix}users`.`user_id`, `{$table_prefix}users`.`username`, `{$table_prefix}users`.`user_avatar`, `{$table_prefix}users`.`user_avatar_type`, `".friendsTable."`.`isonline`, `".friendsTable."`.`current_server`, `".friendsTable."`.`hostname` FROM `{$table_prefix}users`
																					LEFT JOIN `".friendsTable."` ON `{$table_prefix}users`.`user_id` = `".friendsTable."`.`user_id` 
																					WHERE LOWER(`{$table_prefix}users`.`username`) like LOWER('%{$this->db->prepare($query)}%')
																					AND `{$table_prefix}users`.`user_type` != 2
																					AND `{$table_prefix}users`.`user_id` != '{$login->user->data['user_id']}'
																					ORDER BY `".friendsTable."`.`current_server` != '' DESC, `".friendsTable."`.`current_server` != '0.0.0.0' DESC, `".friendsTable."`.`current_server` != 'none' DESC, `".friendsTable."`.`isonline` = 1 DESC, `{$table_prefix}users`.`user_avatar`
																					LIMIT 50"));
			//get current frienddata
			$friendData = $this->db->fetch($this->db->query("SELECT `friends_ids` FROM `".friendsTable."`
																			WHERE `user_id` = '{$login->user->data['user_id']}'"));
			$friendData['friends_ids'] = explode(',', $friendData['friends_ids']);

			$formattedFriends = array();
			foreach($friends as $index => $friend) {
				//save
				$friend['avatar'] = $this->getAvatar($friend['user_avatar'], $friend['user_avatar_type']);
				$friend['friend'] = in_array($friend['user_id'], $friendData['friends_ids']);

				//if he's a friend prepend him to the top of our list
				if($friend['friend'])
					array_unshift($formattedFriends, $friend);
				else
					$formattedFriends[] = $friend;
			}
			return $formattedFriends;
		}

		//Find the userid with the closest username that is not a friend
		public function finduserID($username) {
			global $table_prefix, $login;
			$friendData = $this->db->fetch($this->db->query("SELECT * FROM `".friendsTable."` 
														WHERE `user_id` = '{$login->user->data['user_id']}'"));

			$friendData['friends_ids'] = explode(',', $friendData['friends_ids']);
			$excludeFriends = '';
			foreach($friendData['friends_ids'] as $index => $friend) {
				if(count($friendData['friends_ids'])-1 == $index)
					$excludeFriends .= "`{$table_prefix}users`.`user_id` = '$friend' ASC ";
				else
					$excludeFriends .= "`{$table_prefix}users`.`user_id` = '$friend' ASC, ";
			}

			$userData = $this->db->fetch($this->db->query("SELECT `user_id`, `username` FROM `{$table_prefix}users`
																			WHERE LOWER(`username`) = LOWER('$username')
																			AND `{$table_prefix}users`.`user_id` != '{$login->user->data['user_id']}'
																			AND `{$table_prefix}users`.`user_type` != 2 
																			ORDER BY $excludeFriends
																			LIMIT 1"));
			if(empty($userData['username']))
				return array('user_id' => 0, 'username' => '');

			return $userData;
		}

		//get users avatar
		private function getAvatar($user_avatar, $user_avatar_type) {
			global $config;
			if ($user_avatar_type == 1) {

				// AVATAR_UPLOAD
				return '/download/file.php?avatar='.$user_avatar;
			
			} else if ($user_avatar_type == 3) {
			
				return $config['avatar_gallery_path'].'/'.$user_avatar;
			
			} else if($user_avatar_type == 2) {
			
				// AVATAR REMOTE URL
				return $user_avatar;
			
			}
			return null;
		}

		//When the ip that the client is playing on is local, we wanna use the clients external ip address. Otherwise outsiders won't be able to connect
		private function parseServerIP($ip, $externalIP) {
			//iw4m fl0w's script makes the ip go 'none' bleh, so we gotta put this in
			if($ip == 'none')
				return '';

			if($ip == '0.0.0.0')
				return '';

			$split = explode(':', $ip);
			
			if($split[0] == '0.0.0.0')
				return '';

			if(!isset($split[1]))
				return $ip;
			
			if ( !filter_var($split[0], FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE)) {
				return $externalIP.':'.$split[1];
			}

			return $ip;
		}

		private function issetUserID($id) {
			global $table_prefix;
			return $this->db->rows($this->db->query("SELECT `user_id` FROM `{$table_prefix}users`
																	WHERE `user_id` = '{$this->db->prepare($id)}'"));
		}
}//end