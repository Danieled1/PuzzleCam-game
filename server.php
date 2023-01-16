<?php
$db_host = "localhost";
$db_user = "root";
$db_password = "";

$lnk=mysqli_connect($db_host,$db_user,$db_password);
if(!$lnk)
    die('Database connection failed');

mysqli_select_db($lnk,"puzzlecam") or die ("Failed to select DB");

if(isset($_GET["info"])){
    $info=json_decode($_GET["info"],true);
    if(addScore($info,$lnk)){
        echo "Score inserted!";
    }else{
        echo "Score insertion failed!";
    }
}else{
    $results = getAllScores($lnk);
    echo json_encode($results);
}

function addScore($info,$lnk){
    $query="INSERT INTO Scores (Name,Time,Difficulty) VALUES ('".$info["name"]."',".$info["time"].",'".$info["difficulty"]."')";
    $rs = mysqli_query($lnk,$query);
    if(!$rs){
        return false;
    }
    return true;
}

// $results = getAllScores($lnk);
// echo json_encode($results);

function getAllScores($lnk){
    $easy = getScoresWithDifficulty("Easy",$lnk);
    $medium = getScoresWithDifficulty("Medium",$lnk);
    $hard = getScoresWithDifficulty("Hard",$lnk);
    $extreme = getScoresWithDifficulty("Extreme",$lnk);
    return array("easy"=>$easy,"medium"=>$medium,"hard"=>$hard,
        "extreme"=>$extreme);
}
function getScoresWithDifficulty($difficulty,$lnk) {
    $query="Select Name, Time FROM Scores WHERE Difficulty Like'".$difficulty."'ORDER BY Time";

    $rs=mysqli_query($lnk,$query);

    $results = array();
    if(mysqli_num_rows($rs)>0){
        while($row=mysqli_fetch_assoc($rs)){
            array_push($results,$row);
        }
    }
    return $results;
}

?>