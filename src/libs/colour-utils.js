import legoPalette from './available-lego-brick-colours'

const DeltaE = require('delta-e')

export const h2r = hex => {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null
}

export const lab2rgb = lab => {
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

export const rgb2lab = rgb => {
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

export const getHex = (r, g, b) => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1, 7)
}

export const remapPixelColours = originalImageData => {
  let mapping = {}

  let imageData = {
    width: originalImageData.width,
    height: originalImageData.height,
    data: new Uint8ClampedArray(originalImageData.data),
  }

  for (var i = 0; i < imageData.data.length; i += 4) {
    let mappedColour = mapColorToPalette(
      imageData.data[i],
      imageData.data[i + 1],
      imageData.data[i + 2]
    )
    if (
      !mapping[
        getHex(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2])
      ]
    ) {
      mapping[
        getHex(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2])
      ] = getHex(mappedColour.r, mappedColour.g, mappedColour.b)
    }
    imageData.data[i] = mappedColour.r
    imageData.data[i + 1] = mappedColour.g
    imageData.data[i + 2] = mappedColour.b
  }

  // console.log(imageData, mapping)
  return { imageData, mapping }
}

export const mapColorToPalette = (red, green, blue) => {
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
