import legoPalette from './data/available-lego-brick-colours'

var DeltaE = require('delta-e')

// Converts a #ffffff hex string into an [r,g,b] array
export function h2r(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null
}

// Inverse of the above
export function r2h(rgb) {
  // return '#' + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)
  // rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  function hex(x) {
    return ('0' + parseInt(x).toString(16)).slice(-2)
  }
  return '#' + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2])
}

// Interpolates two [r,g,b] colors and returns an [r,g,b] of the result
// Taken from the awesome ROT.js roguelike dev library at
// https://github.com/ondras/rot.js
export function _interpolateColor(color1, color2, factor) {
  if (arguments.length < 3) {
    factor = 0.5
  }
  let result = color1.slice()
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]))
  }
  return result
}

export function rgb2hsl(color) {
  let r = color[0] / 255
  let g = color[1] / 255
  let b = color[2] / 255

  let max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h,
    s,
    l = (max + min) / 2

  if (max == min) {
    h = s = 0 // achromatic
  } else {
    let d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [h, s, l]
}

export function hsl2rgb(color) {
  let l = color[2]

  if (color[1] == 0) {
    l = Math.round(l * 255)
    return [l, l, l]
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) {
        t += 1
      }
      if (t > 1) {
        t -= 1
      }
      if (t < 1 / 6) {
        return p + (q - p) * 6 * t
      }
      if (t < 1 / 2) {
        return q
      }
      if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6
      }
      return p
    }

    let s = color[1]
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s
    let p = 2 * l - q
    let r = hue2rgb(p, q, color[0] + 1 / 3)
    let g = hue2rgb(p, q, color[0])
    let b = hue2rgb(p, q, color[0] - 1 / 3)
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }
}

export function _interpolateHSL(color1, color2, factor) {
  if (arguments.length < 3) {
    factor = 0.5
  }
  let hsl1 = rgb2hsl(color1)
  let hsl2 = rgb2hsl(color2)
  for (let i = 0; i < 3; i++) {
    hsl1[i] += factor * (hsl2[i] - hsl1[i])
  }
  return hsl2rgb(hsl1)
}

const palette = legoPalette.map(obj => {
  let rgb = h2r(obj.hex)
  return {
    r: rgb[0],
    g: rgb[1],
    b: rgb[2],
  }
})

const labpalette = legoPalette.map(obj => {
  let rgb = rgb2lab(h2r(obj.hex))
  return rgb
})

// var nearestColor = require('nearest-color').from(palette.map((c) => {
//   return r2h([c.r, c.g, c.b])
// }))
// use Euclidian distance to find closest color
// send in the rgb of the pixel to be substituted
export function mapColorToPalette(red, green, blue) {
  // console.log(r2h([red, green, blue]))
  // return nearestColor(r2h([red, green, blue]))
  let color, diffR, diffG, diffB, diffDistance, mappedColor
  let distance = 25000
  for (let i = 0; i < labpalette.length; i++) {
    color = labpalette[i]
    // diffR = (color.r - red)
    // diffG = (color.g - green)
    // diffB = (color.b - blue)
    // diffDistance = diffR * diffR + diffG * diffG + diffB * diffB
    let inputColour = rgb2lab([red, green, blue])
    diffDistance = DeltaE.getDeltaE94(
      { L: color[0], A: color[1], B: color[2] },
      { L: inputColour[0], A: inputColour[1], B: inputColour[2] }
    )
    // console.log(color, red, green, blue, diffDistance)
    if (diffDistance < distance) {
      distance = diffDistance
      mappedColor = lab2rgb(labpalette[i])
    }
  }
  return {
    r: mappedColor[0],
    g: mappedColor[1],
    b: mappedColor[2],
  }
}

/**
 * Takes a colour and finds its nearest not-matching colour.
 * @param {string} inputColour
 */
export function getNextBestColourMatch(inputColour, exclusions) {
  let color, diffDistance, mappedColor
  let distance = 25000
  // let exclusionsAsLab = exclusions.map(colour => {
  //   return rgb2lab(h2r(colour))
  // })

  let testPalette = labpalette.filter(colour => {
    let colourAsHex = r2h(lab2rgb(colour))
    let index = exclusions.findIndex(ecol => {
      // return ecol[0] === colour[0] && ecol[1] === colour[1] && ecol[2] === colour[2]
      return ecol === colourAsHex
    })
    return index === -1
  })

  for (let i = 0; i < testPalette.length; i++) {
    color = testPalette[i]
    let input = rgb2lab(h2r(inputColour))
    diffDistance = DeltaE.getDeltaE00(
      { L: color[0], A: color[1], B: color[2] },
      { L: input[0], A: input[1], B: input[2] }
    )
    if (diffDistance < distance && diffDistance > 0) {
      distance = diffDistance
      mappedColor = lab2rgb(testPalette[i])
    }
  }
  // console.log(diffDistance)
  return r2h(mappedColor)
}

export function lab2rgb(lab) {
  var y = (lab[0] + 16) / 116,
    x = lab[1] / 500 + y,
    z = y - lab[2] / 200,
    r,
    g,
    b

  x = 0.95047 * (x * x * x > 0.008856 ? x * x * x : (x - 16 / 116) / 7.787)
  y = 1.0 * (y * y * y > 0.008856 ? y * y * y : (y - 16 / 116) / 7.787)
  z = 1.08883 * (z * z * z > 0.008856 ? z * z * z : (z - 16 / 116) / 7.787)

  r = x * 3.2406 + y * -1.5372 + z * -0.4986
  g = x * -0.9689 + y * 1.8758 + z * 0.0415
  b = x * 0.0557 + y * -0.204 + z * 1.057

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b

  return [
    Math.max(0, Math.min(1, r)) * 255,
    Math.max(0, Math.min(1, g)) * 255,
    Math.max(0, Math.min(1, b)) * 255,
  ]
}

export function rgb2lab(rgb) {
  var r = rgb[0] / 255,
    g = rgb[1] / 255,
    b = rgb[2] / 255,
    x,
    y,
    z

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}

// calculate the perceptual distance between colors in CIELAB
// https://github.com/THEjoezack/ColorMine/blob/master/ColorMine/ColorSpaces/Comparisons/Cie94Comparison.cs

// export function deltaE (labA, labB) {
//   var deltaL = labA[0] - labB[0]
//   var deltaA = labA[1] - labB[1]
//   var deltaB = labA[2] - labB[2]
//   var c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2])
//   var c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2])
//   var deltaC = c1 - c2
//   var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC
//   deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH)
//   var sc = 1.0 + 0.045 * c1
//   var sh = 1.0 + 0.015 * c1
//   var deltaLKlsl = deltaL / (1.0)
//   var deltaCkcsc = deltaC / (sc)
//   var deltaHkhsh = deltaH / (sh)
//   var i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh
//   return i < 0 ? 0 : Math.sqrt(i)
// }

function padToTwo(numberString) {
  if (numberString.length < 2) {
    numberString = '0' + numberString
  }
  return numberString
}

export function hexAverage() {
  var args = Array.prototype.slice.call(arguments)
  // console.log(args, arguments)
  return args
    .reduce(
      function(previousValue, currentValue) {
        return currentValue
          .replace(/^#/, '')
          .match(/.{2}/g)
          .map(function(value, index) {
            return previousValue[index] + parseInt(value, 16)
          })
      },
      [0, 0, 0]
    )
    .reduce(function(previousValue, currentValue) {
      return (
        previousValue +
        padToTwo(Math.floor(currentValue / args.length).toString(16))
      )
    }, '#')
}
