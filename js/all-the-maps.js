var mercator = d3.geoProjection(function (x, y) {
  return [x, Math.log(Math.tan(Math.PI / 4 + y / 2))]
})

var path = d3.geoPath().projection(mercator)

d3.json('data/maps.json', function (geojson) {
  var maps = d3.select('#maps').selectAll('li').data(geojson.features)
    .enter().append('li')

  var svg = maps
    .append('a')
      .attr('href', function (d) {
        return 'http://maps.nypl.org/warper/maps/' + d.properties.id
      })
    .append('svg')
      .attr('width', '100%')
      .attr('viewBox', '0 0 100 100')
      .each(drawMap)

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

  mercator.scale(s).translate(t);

  d3.select(this)
		.selectAll('path')
		.data([map])
		.enter().append('path')
		.attr('d', path)
    // .attr("class", function(d, i) { return "color" + (i + 1); })
    // .style("stroke-width", function(d, i) { return ((strokes.length - i) * 2 - 1) * strokeWidth; });
}
