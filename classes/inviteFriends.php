<?php
	/**
	 * Class for getting inviting friends, requesting a friendship. Accepting, declining etc.
	 */
	class inviteFriends {
		
		private $db;
			
		public function __construct() {

			$this->db = New Database;

		}

		/*
			0 = error (something unexpected happen ;())
			1 = new invite
			2 = already invited
			3 = declined (only if the other user requests an invite will accept)

			column status:
			0 = waiting
			1 = declined
		*/
		//request a new friendship
		public function request($id) {
			global $login;
			
			$id = $this->db->prepare($id);
			if(!is_numeric($id))
				return false;

			//check if this userid exists
			if(!($this->issetUserID($id)))
				return 0;

			//check if we haven't already got an invite between these two users
			$invite = $this->db->fetch($this->db->query("SELECT * FROM `".inviteTable."`
													WHERE (`from` = '{$login->user->data['user_id']}'
													AND `to` = '$id')
													OR (`to` = '{$login->user->data['user_id']}'
													AND `from` = '$id')"));
			//check if we don't already have this dude as a friend
			$friendData = $this->db->fetch($this->db->query("SELECT `friends_ids` FROM `".friendsTable."`
																			WHERE `user_id` = '{$login->user->data['user_id']}'"));
			if(in_array($id, explode(',', $friendData['friends_ids'])))
				return 5;

			//new invite, insert
			if(!count($invite))
				if($this->db->query("INSERT INTO `".inviteTable."` SET
																`from` = '{$login->user->data['user_id']}',
																`to` = '$id'"))
					return 1;
				else
					return 0;

			//if existing invite has been declined
			if($invite['status'] == 1) {
				//if the declined invite was towards us and we are now requesting it, lets face it: We have changed our heart, lets accept it.
				if($invite['to'] == $login->user->data['user_id'])
					if($this->respondRequest($invite['from'], 1))
						return 4;
				return 3;
			}

			//existing invite but not declined, if from the same user that has requested in the at the first time, ignore (2)
			if($invite['from'] == $login->user->data['user_id'])
				return 2;

			//Else the user is requesting a friendship if a user that already has sent in the same request.
			if($this->respondRequest($invite['from'], 1))
				return 6;

		}

		//gets all the open friend requests for that user
		public function getRequests() {
			global $login, $table_prefix;

			return $this->db->fetchAll($this->db->query("SELECT `".inviteTable."`.*, `{$table_prefix}users`.`username`, `".inviteTable."`.`from` FROM `".inviteTable."`
																LEFT JOIN `{$table_prefix}users` ON `{$table_prefix}users`.`user_id` = `".inviteTable."`.`from` 
																WHERE `".inviteTable."`.`to` = '{$login->user->data['user_id']}'
																AND `".inviteTable."`.`status` = 0"));
		}

		public function unfriend($id) {
			global $login;

			//check if this userid exists
			if(!($this->issetUserID($id)))
				return false;

			if($this->removeFriend($login->user->data['user_id'], $id))
				return $this->removeFriend($id, $login->user->data['user_id']);
		}

		public function respondRequest($fromID, $answer) {
			global $login;
			if(intval($answer) != 0 && intval($answer) != 1)
				return false;

			$fromID = $this->db->prepare($fromID);
			if(!is_numeric($fromID))
				return false;

			//check if this userid exists
			if(!($this->issetUserID($fromID)))
				return false;

			//get requestData, check if the request exists and use it to update the request
			$requestData = $this->db->fetch($this->db->query("SELECT * FROM `".inviteTable."`
																		WHERE `to` = '{$login->user->data['user_id']}'
																		AND `from` = '$fromID' "));

			if(!isset($requestData['to']))
				return false;

			//$answer == 1 means accepted, add to and from to friend lists and delete request
			if($answer == 1) {

				//update the requesters friendlist first
				$this->addFriend($requestData['from'], $requestData['to']);
				//then update us, that just accepted the friend request
				$this->addFriend($requestData['to'], $requestData['from']);

				//delete request, cuz its not needed any longer
				return $this->db->query("DELETE FROM `".inviteTable."`
											WHERE `to` = '{$requestData['to']}'
											AND `from` = '{$requestData['from']}'");

			} else {
				
				//user has declined the request, update the request
				return $this->db->query("UPDATE `".inviteTable."` SET
														`status` = '1'
														WHERE `to` = '{$requestData['to']}'
														AND `from` = '{$requestData['from']}'");
			
			}

		}


		private function addFriend($id, $friendID) {
			$id = $this->db->prepare($id);
			$friendID = $this->db->prepare($friendID);
			if(!is_numeric($id))
				return false;

			if(!is_numeric($friendID))
				return false;

			//check if this userid exists
			if(!($this->issetUserID($id)))
				return false;

			//check if this userid exists
			if(!($this->issetUserID($friendID)))
				return false;

			//get from $id userData that will be manipulated
			$userData = $this->db->fetch($this->db->query("SELECT * FROM `".friendsTable."`
																WHERE `user_id` = '{$id}'"));
			//no record found in the friends table about this user. Insert! (Fl0W this shouldn't happen, but alas)
			if(!count($userData))
				$this->db->query("INSERT INTO `".friendsTable."` SET
																`user_id` = '{$id}'");
			if(!isset($userData))
				$userData = array();
			
			if(!isset($userData['friends_ids']))
				$userData['friends_ids'] = array();
			else
				$userData['friends_ids'] = array_unique(explode(',', $userData['friends_ids']));

			if(in_array($friendID, $userData['friends_ids']))
				return false;

			//append to friends_ids
			$userData['friends_ids'][] = $friendID;

			$friends_ids = implode(',', array_values($userData['friends_ids']));

			//save from's friends
			return $this->db->query("UPDATE `".friendsTable."` SET
												`friends_ids` = '".($friends_ids[0] == ',' ? substr($friends_ids, 1) : $friends_ids)."'
											WHERE `user_id` = '{$id}'");
		}


		private function removeFriend($id, $friendID) {
			$id = $this->db->prepare($id);
			$friendID = $this->db->prepare($friendID);

			if(!is_numeric($id))
				return false;

			if(!is_numeric($friendID))
				return false;

			//check if this userid exists
			if(!($this->issetUserID($id)))
				return false;

			//check if this userid exists
			if(!($this->issetUserID($friendID)))
				return false;

			//get from $id userData that will be manipulated
			$userData = $this->db->fetch($this->db->query("SELECT * FROM `".friendsTable."`
																WHERE `user_id` = '{$id}'"));
			//no record found in the friends table about this user. Insert! (Fl0W this shouldn't happen, but alas)
			if(!count($userData))
				$this->db->query("INSERT INTO `".friendsTable."` SET
																`user_id` = '{$id}'");
			if(!isset($userData))
				$userData = array();
			
			if(!isset($userData['friends_ids']))
				$userData['friends_ids'] = array();
			else
				$userData['friends_ids'] = array_unique(explode(',', $userData['friends_ids']));

			if(!in_array($friendID, $userData['friends_ids']))
				return false;

			//remove friend from friends_ids
			foreach($userData['friends_ids'] as $key => $friend) {
				if($friend == $friendID)
					unset($userData['friends_ids'][$key]);
			}
			$friends_ids = implode(',', array_values($userData['friends_ids']));

			//save from's friends
			return $this->db->query("UPDATE `".friendsTable."` SET
												`friends_ids` = '".($friends_ids[0] == ',' ? substr($friends_ids, 1) : $friends_ids)."'
											WHERE `user_id` = '{$id}'");
		}

		private function issetUserID($id) {
			global $table_prefix;
			return $this->db->rows($this->db->query("SELECT `user_id` FROM `{$table_prefix}users`
																	WHERE `user_id` = '{$this->db->prepare($id)}'"));
		}

}