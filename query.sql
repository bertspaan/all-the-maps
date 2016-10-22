SELECT
  id,
  ST_AsGeoJSON(
    ST_SimplifyPreserveTopology(geometry, 0.0001),
    6
  )
FROM
  objects
ORDER BY
  ST_NPoints(geometry) DESC
LIMIT
  10000;
