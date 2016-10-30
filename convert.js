const fs = require('fs')
const H = require('highland')
const R = require('ramda')
const argv = require('minimist')(process.argv.slice(2))

var stream = ((argv._.length ? fs.createReadStream(argv._[0], 'utf8') : process.stdin))

H(stream)
  .split()
  .compact()
  .map(R.split('|'))
  .map(R.map(R.trim))
  .map(R.zipObj(['id', 'uuid', 'image_id', 'name', 'geometry']))
  .filter((map) => map.id && map.geometry)
  .map((map) => ({
    id: map.id.trim().split('/')[1],
    uuid: map.uuid.trim(),
    imageId: map.image_id.trim(),
    name: map.name.trim(),
    geometry: JSON.parse(map.geometry)
  }))
  .map((map) => ({
    type: 'Feature',
    properties: {
      id: map.id,
      uuid: map.uuid,
      imageId: map.imageId,
      name: map.name
    },
    geometry: map.geometry
  }))
  .toArray((maps) => {
    console.log(JSON.stringify({
      type: 'FeatureCollection',
      features: maps
    }))
  })
