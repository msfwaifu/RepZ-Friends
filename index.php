<?php
include('mainframe.php');
//debug($login->user->data);
header('location: api.php');
if($devmode) {
	debug(array_merge($_POST, $_GET) );
	echo Database::showQueries();
}
?>