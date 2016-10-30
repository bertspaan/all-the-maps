SELECT
  id,
  data->>'uuid' AS uuid,
  data->>'nyplDigitalId' AS image_id,
  name,
  ST_AsGeoJSON(
    ST_SimplifyPreserveTopology(geometry, 0.0001),
    6
  )
FROM
  objects
ORDER BY
  ST_NPoints(geometry) DESC
LIMIT
  5000;
