<?php

	include('mainframe.php');
	$api = New Api;
	if(empty($_POST)){
		$_POST = array();
	}
	
	if(empty($_GET)){
		$_GET = array();
	}
	
	//Get request
	$api->ProcessRequest( array_merge($_POST, $_GET) );

?>