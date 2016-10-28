var mercator = d3.geoProjection(function (x, y) {
  return [x, Math.log(Math.tan(Math.PI / 4 + y / 2))]
})

var path = d3.geoPath().projection(mercator)

var geojson = {}

function updateMaps(features) {
  console.log(features[0].properties.id, features[0].properties.name)
  var maps = d3.select('#maps').selectAll('li')
    .data(features, function (d) {
      return d.properties.id + Math.floor(Date.now() / 1000)

    })

  var newMaps = maps.enter().append('li')

  console.log('Enter:', maps.enter().size())
  console.log('Update:', maps.size())
  console.log('Exit:', maps.exit().size())


  maps.exit().remove()

  newMaps
    .append('a')
      .attr('href', function (d) {
        return 'http://digitalcollections.nypl.org/items/' + d.properties.uuid
        // return 'http://maps.nypl.org/warper/maps/' + d.properties.id
      })
    .append('svg')
      .attr('width', '100%')
      .attr('viewBox', '0 0 100 100')
      .each(drawMap)

  newMaps
    .append('div')
      .attr('class', 'title-container')
    .append('span')
      .attr('class', 'title')
      .text(function (d) {
        return d.properties.name
      })

}

d3.json('data/maps.json', function (newGeojson) {
  geojson = newGeojson
  updateMaps(geojson.features)

  d3.select('#map-count')
    .text(geojson.features.length)

  var sortLinks = [
    {
      text: 'number of vertices',
      sort: function (a, b) {
        return -1
      }
    },
    {
      text: 'name',
      sort: function (a, b) {
        return a.properties.name < b.properties.name ? -1 : 1
      }
    },
    {
      text: 'error',
      sort: function (a, b) {
        return -1
      }
    },
    {
      text: 'ID',
      sort: function (a, b) {
        return 1
      }
    }
  ]

  d3.select('#sort-links').selectAll('li').data(sortLinks)
    .enter().append('li')
      .append('a')
      .attr('href', 'javascript:void(0);')
      .text(function (d) {
        return d.text
      })
      .on('click', function(d) {
        geojson.features = geojson.features.slice().sort(d.sort)
        updateMaps(geojson.features)
      })

  d3.select('#loading').remove()
})

function drawMap(d, i) {
  var map = d.geometry

  var width = 100
  var height = 100

  mercator.scale(1).translate([0, 0])

  var b = path.bounds(map)
  var s = .90 / Math.max(
    (b[1][0] - b[0][0]) / (width),
    (b[1][1] - b[0][1]) / (height)
  )
  var t = [
    (width - s * (b[1][0] + b[0][0])) / 2,
    (height - s * (b[1][1] + b[0][1])) / 2
  ]

  mercator.scale(s).translate(t)

  var p = path(d)
  var containsNaN = p.indexOf('NaN') > -1

  if (!containsNaN) {
    d3.select(this)
  		.selectAll('path')
  		.data([map])
  		.enter().append('path')
  		.attr('d', p)
  } else {
    var svg = d3.select(this)
      .attr('class', 'error')

    svg.append('line')
      .attr('x1', 10)
      .attr('y1', 10)
      .attr('x2', 90)
      .attr('y2', 90)

    svg.append('line')
      .attr('x1', 10)
      .attr('y1', 90)
      .attr('x2', 90)
      .attr('y2', 10)
  }
}
