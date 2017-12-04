<?php
//Copyright Iain Munro, please do not share or distribute
class Database {
	
	var $log;
	public static $SQL_CURRENTDB = null;
	
	function __construct($autocommit = true) {
		$this->connect($autocommit);
		if(mysqli_error($this->connect)) {
			die (mysqli_error($this->connect));
		}
	}
	
	function __destruct() {
    	$this->close();
    }

	public function connect($autocommit) {
		global $GLOBALS, $dbhost, $dbname, $dbuser, $dbpasswd;
		$this->connect = mysqli_connect($dbhost, $dbuser, $dbpasswd) or die (mysqli_error($this->connect));
		
		if(!isset($GLOBALS['SQL_DATABASE'])) {
		
			self::$SQL_CURRENTDB = $dbname;
			mysqli_select_db($this->connect, $dbname);
		
		} else {
		
			self::$SQL_CURRENTDB = $GLOBALS['SQL_DATABASE'];
			mysqli_select_db($this->connect, $GLOBALS['SQL_DATABASE']);
		
		}
		
		$this->connect->set_charset("utf8");
		
		mysqli_autocommit($this->connect, $autocommit);
	}
	
	public function selectDB($db) {
		
		//check if we are already in this database
		if(self::$SQL_CURRENTDB == $db)
			return true;
	
		if( mysqli_select_db($this->connect, $db) ) {
			self::$SQL_CURRENTDB = $db;
			return true;
		}
		return false;;
	
	}
	
	public function commit() {
		mysqli_commit($this->connect);
	}
	
	public function rollback() {
		mysqli_rollback($this->connect);
	}
	
	public function prepare($data, $strip_tags = true, $json_decode = false) {

		if(is_array($data)) {
			
			return mysqli_real_escape_array($this->connect, $data, $strip_tags, $json_decode);
		
		} else {
			
			return mysqli_real_escape_string($this->connect, !$strip_tags ? $data : strip_tags($data) );
		
		}
	
	}
	
	public function query($command) {		
		$this->saveToLog($command);
		$reply = mysqli_query($this->connect, $command);
		if(is_bool($reply) && $reply === false)
			die($this->error());
		return $reply;
	}
	
	public function fetch($command, $log = true) {
		
		if(is_bool($command))
			die($this->error());
		
		$reply = mysqli_fetch_assoc($command);
		if($log)
			$this->saveToLog($reply);
		//if SELECT id as result FROM table then only return this result, not an array
		if(count($reply) == 1 && isset($reply['result']))
			return $reply['result'];
		return $reply;
	
	}
	
	public function fetchAll($command, $log = true) {
		
		if(is_bool($command))
			die($this->error());
		
		$reply = array();
		
		while ($data = $this->fetch($command, $log)) {
			$reply[] = $data;
		}
		
		if($log)
			$this->saveToLog($reply);
		return $reply;
	
	}
	
	public function rows($command) {
		$reply = mysqli_num_rows($command);
		return $reply;
	}
	
	public function count($command) {
	
		return $this->rows($command);
		
	}
	
	public function field($command) {
		$reply = mysqli_fetch_field($command);
		return $reply;
	}
	
	public function insert_id() {
		return mysqli_insert_id($this->connect);
	}
	
	public function save($dataArrays, $conditions = array()) {
		
		foreach($dataArrays as $table => $dataArray) {
			$sql = '';
			$package	= '';
			$i			= 0;
			$numItems	= count($dataArray);
			$condition	= !empty($conditions[$table]) ? $conditions[$table] : 'WHERE 1 = 1';
			
			foreach($dataArray as $index => $data) {

				$data = is_array($data) ? json_encode($data) : $data;
				
				if(++$i === $numItems) {
				
					$package .= "`{$this->prepare($index)}` = '{$this->prepare($data)}' \n";
				
				} else{ 
				
					$package .= "`{$this->prepare($index)}` = '{$this->prepare($data)}', \n";
				
				}
			
			}

			if( empty($conditions[$table]) ) {
			
				$sql .= 'INSERT INTO '.$table.' SET '.$package.';';
			
			} else {

				$sql .= 'UPDATE '.$table.' SET '.$package.' WHERE  '.$condition.';';
			
			}
			$this->query($sql);
		}
	
	}
	
	//returns layout of current or given database
	//if 
	public function getdblayout($db = null) {
		if($db != null) {
			$revertdb = self::$SQL_CURRENTDB;
			if(!$this->selectDB($db))
				return 'getdblayout(): Error selecting database';
		} else {
			
			$db = self::$SQL_CURRENTDB;
			
		}
		
		$layout = array();
		foreach($this->fetchAll($this->query('SHOW TABLES')) as $table) {	
			
			$table = $table['Tables_in_'.$db];
			foreach($this->fetchAll($this->query("DESCRIBE $table")) as $id => $column) {
			
				$layout[ $table ][$column['Field']] = $column;
			
			}
		
		}
		if(isset($revertdb))
			$this->selectDB($revertdb);
		
		return $layout;
	}
	
	public function getColumns($table) {
	
		$all = $this->fetchAll($this->query("DESCRIBE `$table`"));
		$fields = array();
		
		foreach ( $all as $row )
			$fields[ $row['Field'] ] = $row;
		
		return $fields;
	}
	
	//Sql import dump in current database
	public function sqlImport($sqlfile) {
		$filename = $sqlfile;
		$sqlfile = fopen($sqlfile, 'r');

		if (!is_resource($sqlfile))
			return 'sqlImport(): sqlfile is not a resource';
		
		$query = array();
		while (feof($sqlfile) === false)  {
		
			$query[] = fgets($sqlfile);

			if (preg_match('~' . preg_quote(';', '~') . '\s*$~iS', end($query)) === 1) {
				
				$query = trim(implode('', $query));

				$this->query($query);

			}
			if(is_string($query))
				$query = array();
		}

		fclose($sqlfile);
		return true;
	}
	
	public function sqldump($db = null, $destination) {
		if($db != null) {
			$revertdb = self::$SQL_CURRENTDB;
			if(!$this->selectDB($db))
				return 'getdblayout(): Error selecting database';
		} else {
			
			$db = self::$SQL_CURRENTDB;
			
		}
		
		if(!function_exists('exec'))
			die('Please enable exec function in php.ini');
		
		exec('mysqldump --user='.SQL_USERNAME.' --password='.SQL_PASSWORD.' --host='.SQL_HOSTNAME.' '.$db.' > '.RL.'/tmp/sqldump.sql');
		$sqlDump = rename(RL.'/tmp/sqldump.sql', $destination);
					
		if(isset($revertdb))
			$this->selectDB($revertdb);
		
		return $sqlDump;
	}
	
	public function error() {
		return mysqli_error($this->connect);
	}
	
	public function close() {
		mysqli_close($this->connect);
	}
	
	public function saveToLog($data) {
		global $log;
		
		$log .= debug($data, false);
	}
	
	public static function showQueries() {
		global $log;
		return $log;
	}
}
//Real escapes every value and key of the given array
function mysqli_real_escape_array($dbConnection, $array, $strip_tags = true, $json_decode = false) {
	
	if (!is_array($array)) return;
   		$helper = array();
    
    foreach ($array as $key => $value) {
	    
	    if( !is_array($value) && is_array(json_decode($value, true)) && $json_decode == true)
    		$value = json_decode($value, true);
	    
	    if( !is_array($value) && is_array(json_decode(stripslashes($value), true)) && $json_decode == true)
    		$value = json_decode(stripslashes($value), true);
	    
	    if(is_array($value)) {
		
		    $helper[mysqli_real_escape_string($dbConnection, !$strip_tags ? $key : strip_tags($key))] = mysqli_real_escape_array($dbConnection, $value, $strip_tags, $json_decode);
	    
	    } else {
		
		    $helper[mysqli_real_escape_string($dbConnection, !$strip_tags ? $key : strip_tags($key))] = mysqli_real_escape_string($dbConnection, !$strip_tags ? $value : strip_tags($value));
	    
	    }
	    
	    
    }
    
    return $helper;
    
}