<?php
$url = "https://api.rijdendetreinen.nl/v1/json/stations";

header("Content-Type: application/json");
echo file_get_contents($url);