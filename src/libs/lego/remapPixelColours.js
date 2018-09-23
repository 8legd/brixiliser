import { mapColorToPalette } from './colour-interpolate'

function getHex(r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1, 7)
}

export default function remapPixelColours(originalImageData) {
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
  return { imageData, mapping }
}
