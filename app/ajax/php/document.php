<?php

require_once("../../php/init.php");
require_once("_helpers.php");


//select database
$db = findDB($_GET['db']);
$m = new mymongo($db['hosts'],$db['user'],$db['password'],$db['db'],$db['replicaSet'],$db['ssl']);

$_GET['col'] = removeSlashes($_GET['col']);

//select collection
$m->changeTable($_GET['col']);

//parse id
$id = $_GET['id'];
$query = array('_id' => new MongoId($id));

//do the query
$doc = $m->findOne($query);

$doc = private_transformation_read($_GET['db'],$_GET['col'],$doc); //in config.php

echo json_encode($doc);

?>