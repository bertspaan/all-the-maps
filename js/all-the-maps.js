var mercator = d3.geoProjection(function (x, y) {
  return [x, Math.log(Math.tan(Math.PI / 4 + y / 2))]
})

var path = d3.geoPath().projection(mercator)

var geojson = {}
var currentMap
var timer
var sortField = 0
var sortOrder = 1

function geometryToPath (geometry) {
  var width = 100
  var height = 100

  mercator.scale(1).translate([0, 0])

  var b = path.bounds(geometry)
  var s = .90 / Math.max(
    (b[1][0] - b[0][0]) / (width),
    (b[1][1] - b[0][1]) / (height)
  )
  var t = [
    (width - s * (b[1][0] + b[0][0])) / 2,
    (height - s * (b[1][1] + b[0][1])) / 2
  ]

  mercator.scale(s).translate(t)

  var p = path(geometry)
  var containsNaN = p.indexOf('NaN') > -1

  if (!containsNaN) {
    return p
  } else {
    return undefined
  }
}

function updateMaps(features) {
  d3.select('#maps').selectAll('li').remove()

  var maps = d3.select('#maps').selectAll('li')
    .data(features, function (d) {
      return d.properties.id
    })

  var newMaps = maps.enter().append('li')

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
      .attr('class', 'image-container')
    .on('mouseenter', function (d) {
      if (currentMap !== d.properties.id) {
        var li = this

        if (timer) {
          window.clearTimeout(timer)
        }

        timer = window.setTimeout(function() {
          var src = 'http://images.nypl.org/index.php?id=' + d.properties.imageId + '&t=w'
          d3.select(li)
            .append('div')
              .attr('class', 'image')
              .style('background-image', 'url(' + src + ')')

          window.setTimeout(function() {
            d3.select(li).select('.image')
              .style('left', 0)
          }, 250)

        }, 250)

        currentMap = d.properties.id
      }

    })
    .on('mouseleave', function (d) {
      currentMap = undefined

      if (timer) {
        window.clearTimeout(timer)
        timer = undefined
      }
      d3.select(this).select('.image').remove()
    })

  newMaps
    .append('div')
      .attr('class', 'title-container')
    .append('span')
      .attr('class', 'title')
      .text(function (d) {
        var MAX_WORDS = 10
        var title
        var words = d.properties.name.split(' ')
        if (words.length > MAX_WORDS) {
          title = words.slice(0, MAX_WORDS).join(' ') + ' …'
        } else {
          title = words.join(' ')
        }
        return title
      })
}

d3.json('data/maps.json', function (newGeojson) {
  geojson = newGeojson

  function countVertices (geometry) {
    return [geometry.coordinates[0]].reduce(function(a, b) {
      return a.concat(b)
    }, []).length
  }

  geojson.features = geojson.features.map(function (feature) {
    feature.properties.vertices = countVertices(feature.geometry)
    feature.properties.path = geometryToPath(feature.geometry)
    feature.properties.error = feature.properties.path ? false : true

    return feature
  })

  updateMaps(geojson.features)

  d3.select('#map-count')
    .text(geojson.features.length)

  var sortLinks = [
    {
      text: 'number of vertices',
      sort: function (a, b) {
        return a.properties.vertices > b.properties.vertices ? -1 : 1
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
        return a.properties.error < b.properties.error ? -1 : 1
      }
    },
    {
      text: 'ID',
      sort: function (a, b) {
        return a.properties.id < b.properties.id ? -1 : 1
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
      .on('click', function(d, i) {
        if (i === sortField) {
          sortOrder = sortOrder * -1
        } else {
          sortOrder = 1
        }

        sortField = i

        geojson.features = geojson.features.slice().sort(function (a, b) {
          return d.sort(a, b) * sortOrder
        })

        updateMaps(geojson.features)
      })

  d3.select('#loading').remove()
})

function drawMap(d) {
  if (d.properties.path) {
    d3.select(this)
  		.selectAll('path')
  		.data([d.geometry])
  		.enter().append('path')
  		.attr('d', d.properties.path)
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
