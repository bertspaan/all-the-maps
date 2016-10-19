SELECT id, ST_AsGeoJSON(geometry) FROM pits
ORDER BY ST_NPoints(geometry) DESC
LIMIT 5000;
