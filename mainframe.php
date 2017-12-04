<?php	
	//Simple staff web application for Repz by Iain Munro
	ob_start();
	
	#### Set stuff ####
	setlocale(LC_ALL, 'nl_NL');
	date_default_timezone_set('Europe/Amsterdam');
	$devmode = false; //Enable error reporting for dev accounts
	
	#### Database and Session handeling ####
	define('RL', dirname(__FILE__));
	require_once('data/defines.php');

	//check if _PHPBBPATH is correctly defined
	if(!file_exists(RL.'/'._PHPBBPATH.'/common.php'))
		die('_PHPBBPATH not correctly defined('.RL.'/'._PHPBBPATH.'/common.php)! cannot find common.php. Goto: "'.RL.'/defines/defines.php" edit _PHPBBPATH');

	//Include PHPBB3
	define('IN_PHPBB', true);
	$phpbb_root_path = _PHPBBPATH;
	$phpEx = substr(strrchr(__FILE__, '.'), 1);
	include(_PHPBBPATH.'/common.php');
	include(_PHPBBPATH.'/config.php');

	#### Database and Session handeling ####
	require_once('classes/sql.php');
	require_once('data/functions.php');
	
	#### Application classes ####
	require_once('classes/login.php');
	require_once('classes/getFriends.php');
	require_once('classes/inviteFriends.php');
	require_once('classes/api.php');

	### Define global classes ####
	$login = new Login;
?>