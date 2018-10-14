import {
  r2h,
  getNextBestColourMatch,
  mapColorToPalette,
} from './colour-interpolate'
import dimensions from './dimensions'

const calculateFromImageData = ({
  imageData: originalImageData,
  orientation,
}) => {
  let currentColour
  const outputBricks = []

  const imageData = {
    width: originalImageData.width,
    height: originalImageData.height,
    data: new Uint8ClampedArray(originalImageData.data),
  }

  for (var i = 0; i < imageData.data.length; i += 4) {
    const color = mapColorToPalette(
      imageData.data[i],
      imageData.data[i + 1],
      imageData.data[i + 2]
    )
    imageData.data[i] = color.r
    imageData.data[i + 1] = color.g
    imageData.data[i + 2] = color.b
  }

  const topLeftPixelValue = r2h([
    imageData.data[0],
    imageData.data[1],
    imageData.data[2],
  ])
  const topLeftAlpha = imageData.data[3]

  for (var i = 0; i < imageData.data.length; i += 4) {
    currentColour = r2h([
      imageData.data[i],
      imageData.data[i + 1],
      imageData.data[i + 2],
    ])
    const alpha = imageData.data[i + 3]

    const isTransparentBlock =
      alpha !== 255 ||
      (currentColour === topLeftPixelValue && alpha === topLeftAlpha)
    if (isTransparentBlock) {
      currentColour = undefined
    }

    outputBricks.push({
      colour: currentColour,
      ignore: !!isTransparentBlock,
      index: i,
    })
  }

  for (let i = 0; i < outputBricks.length; i++) {
    if (outputBricks[i]) {
      outputBricks[i].x = i % imageData.width
      outputBricks[i].y = Math.floor(i / imageData.width)
      outputBricks[i].width = 1
      outputBricks[i].height = 1
    }
  }

  function mergeBlocks(outputBricks) {
    for (let i = 0; i < outputBricks.length - 1; i++) {
      const thisBrick = outputBricks[i]
      const brickColour = thisBrick.colour
      if (!thisBrick.ignore) {
        const brickSizes = getBrickSizesForColour(brickColour, true)

        for (let a = 0, l = brickSizes.length; a < l; a++) {
          let hbrickFit = genericBrickFit(i, brickSizes[a][1], brickSizes[a][0])
          // let vbrickFit = genericBrickFit(i, brickSizes[a][0], brickSizes[a][1])
          if (hbrickFit.fits) {
            thisBrick.width = brickSizes[a][1]
            thisBrick.height = brickSizes[a][0]
            hbrickFit.blocks.map(brick => {
              // brick.colour = undefined
              brick.ignore = true
              // brick.width = 0
              // brick.height = 0
            })
            break
          }
        }

        for (let a = 0, l = brickSizes.length; a < l; a++) {
          let vbrickFit = genericBrickFit(i, brickSizes[a][0], brickSizes[a][1])
          if (vbrickFit.fits) {
            thisBrick.width = brickSizes[a][0]
            thisBrick.height = brickSizes[a][1]
            vbrickFit.blocks.map(brick => {
              // brick.colour = undefined
              brick.ignore = true
              // brick.width = 0
              // brick.height = 0
            })
            break
          }
        }
      }
    }

    mergeSingles(outputBricks)
  }

  mergeBlocks(outputBricks)

  let maxCount = 0
  checkInvalidPixels()

  mergeBlocks(outputBricks)
  // mergeSingles(outputBricks)

  function checkInvalidPixels() {
    maxCount++
    let invalidCount = 0
    for (let i = 0; i < outputBricks.length - 1; i++) {
      const thisBrick = outputBricks[i]
      const brickColour = thisBrick.colour
      if (!thisBrick.ignore) {
        const brickSizes = getBrickSizesForColour(brickColour, false)
        const hasSinglePixelBlock =
          brickSizes.filter(brick => {
            return parseInt(brick[0], 10) === 1 && parseInt(brick[1], 10) === 1
          }).length > 0

        if (
          parseInt(thisBrick.width, 10) === 1 &&
          parseInt(thisBrick.height, 10) === 1 &&
          !hasSinglePixelBlock
        ) {
          // todo: find the next nearest mapping for this colour
          // thisBrick.colour = '#ff00ff'// getNextBestColourMatch(thisBrick.colour)
          if (!outputBricks[i].excludedColours) {
            outputBricks[i].excludedColours = []
          }
          // console.log('outputBricks[i].excludedColours = ', outputBricks[i].excludedColours)
          // console.log(thisBrick)
          outputBricks[i].excludedColours.push(thisBrick.colour)
          thisBrick.colour = getNextBestColourMatch(
            r2h([
              originalImageData.data[thisBrick.index],
              originalImageData.data[thisBrick.index + 1],
              originalImageData.data[thisBrick.index + 2],
            ]),
            outputBricks[i].excludedColours
          )
          invalidCount++
          // todo: re-run the pixel analysis from scratch with new imagedata
        }
      }
    }
    if (invalidCount > 0) {
      // console.log(invalidCount, 'pixels invalid')
      if (maxCount < 10) {
        // mergeSingles(outputBricks)
        checkInvalidPixels()
      }
      // } else {
      //   console.log('all pixels okay!')
    }
  }

  function getBrickSizesForColour(colour, ignoreSmallOnes) {
    return dimensions
      .filter(dimension => dimension[2] === colour)
      .filter(dimension => {
        const width = parseInt(dimension[0], 10)
        const height = parseInt(dimension[1], 10)
        if (ignoreSmallOnes) {
          return width > 1 && height > 1
        }
        return width === 1 || height === 1
      })
      .sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10))
      .reverse()
  }

  function mergeSingles(outputBricks) {
    for (let i = 0; i < outputBricks.length - 1; i++) {
      const thisBrick = outputBricks[i]
      const brickColour = thisBrick.colour
      if (!thisBrick.ignore) {
        if (thisBrick.width === 1 && thisBrick.height === 1) {
          const brickSizes = getBrickSizesForColour(brickColour, false)

          for (let a = 0, l = brickSizes.length; a < l; a++) {
            const hbrickFit = genericBrickFit(
              i,
              brickSizes[a][1],
              brickSizes[a][0]
            )
            if (hbrickFit.fits) {
              thisBrick.width = brickSizes[a][1]
              thisBrick.height = brickSizes[a][0]
              // thisBrick.ignore = false
              // console.log(hbrickFit.blocks.length)
              hbrickFit.blocks.map(brick => {
                // brick.colour = undefined
                brick.ignore = true
                // brick.width = 0
                // brick.height = 0
              })
              break
            }
          }

          for (let a = 0, l = brickSizes.length; a < l; a++) {
            const vbrickFit = genericBrickFit(
              i,
              brickSizes[a][0],
              brickSizes[a][1]
            )
            if (vbrickFit.fits) {
              thisBrick.width = brickSizes[a][0]
              thisBrick.height = brickSizes[a][1]
              // thisBrick.ignore = false
              // console.log(vbrickFit.blocks.length)
              vbrickFit.blocks.map(brick => {
                // brick.colour = undefined
                brick.ignore = true
                // brick.width = 0
                // brick.height = 0
              })
              break
            }
          }
        }
      }
    }
  }

  function genericBrickFit(sourceBrickIndex, width, height) {
    const thisBrick = outputBricks[sourceBrickIndex]
    const additionalBricks = []
    for (let i = 0, l = width; i < l; i++) {
      if (i !== 0) {
        const nextColBrick = outputBricks[sourceBrickIndex + i]
        // if (!nextColBrick) {
        //   additionalBricks.push(nextColBrick)
        // }
        if (nextColBrick) {
          if (
            nextColBrick.width === 1 &&
            nextColBrick.height === 1 &&
            !nextColBrick.ignore
          ) {
            additionalBricks.push(nextColBrick)
          } else {
            additionalBricks.push(undefined)
          }
        } else {
          if (!nextColBrick) {
            additionalBricks.push(nextColBrick)
          }
        }
      }
      for (let j = 1, jl = height; j < jl; j++) {
        const nextLineBrick =
          outputBricks[sourceBrickIndex + i + j * imageData.width]
        // if (!nextLineBrick) {
        //   additionalBricks.push(nextLineBrick)
        // }
        if (nextLineBrick) {
          if (
            nextLineBrick.width === 1 &&
            nextLineBrick.height === 1 &&
            !nextLineBrick.ignore
          ) {
            additionalBricks.push(nextLineBrick)
          } else {
            additionalBricks.push(undefined)
          }
        } else {
          if (!nextLineBrick) {
            additionalBricks.push(nextLineBrick)
          }
        }
      }
    }

    const remainingDistanceToEdge = imageData.width - (i % imageData.width)
    if (remainingDistanceToEdge < width) {
      return {
        fits: false,
      }
    }

    // let unfilteredBricks = additionalBricks.length
    // console.log(additionalBricks.filter((brick) => { return !brick }).length, unfilteredBricks)

    if (
      additionalBricks.filter(brick => {
        return !brick
      }).length
    ) {
      return { fits: false }
    }

    const values = [].concat(thisBrick, additionalBricks)

    // const colour = values[0].colour

    const yahtzeeQualify = values.every((val, i, values) => {
      if (!(values[0].width == 1 && values[0].height == 1) || !!val.ignore) {
        return false
      }
      // if ((val.width === 0 && val.height === 0) || val.ignore) {
      //   return false
      // }
      return val.colour === values[0].colour
    })

    return {
      fits: yahtzeeQualify,
      blocks: additionalBricks,
    }
  }

  const rtn = outputBricks.filter(brick => !brick.ignore)

  return rtn
}

export default calculateFromImageData
