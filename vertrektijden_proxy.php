<?php
$endpoint = "https://api.rijdendetreinen.nl/v2/json/vertrektijden";
$query = http_build_query($_GET);
$url = "{$endpoint}?{$query}";

header("Content-Type: application/json");
echo file_get_contents($url);

https://api.rijdendetreinen.nl/v2/json/vertrektijden