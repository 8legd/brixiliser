import Color from 'color'

const spacer = 0.25

export default function renderImageDataAsLego({
  outputCanvas,
  optimalBricks,
  imageWidth,
  imageHeight,
  offsetX,
  offsetY,
  orentation,
}) {
  const height = imageWidth < imageHeight ? imageHeight : imageWidth
  const outputContext = outputCanvas.getContext('2d')
  outputContext.clearRect(0, 0, outputCanvas.width, outputCanvas.height)
  let canvas = document.createElement('canvas')
  canvas.width = outputCanvas.width
  canvas.height = outputCanvas.height
  let context = canvas.getContext('2d')
  let brickSize = outputCanvas.height / height

  context.lineWidth = 0.25
  context.fillStyle = '#ffffff'

  const drawTile = (row, col) => {
    const size = 32
    context.fillRect(
      size * (row * brickSize),
      size * (col * brickSize),
      size * (row + 1) * brickSize,
      size * (col + 1) * brickSize
    )
    context.strokeRect(
      size * (row * brickSize),
      size * (col * brickSize),
      size * (row + 1) * brickSize,
      size * (col + 1) * brickSize
    )
    // context.strokeRect(0, 32 * brickSize, 32 * brickSize, 32 * brickSize)
    // context.strokeRect(32 * brickSize, 0, 32 * brickSize, 32 * brickSize)
    // context.strokeRect(
    //   32 * brickSize,
    //   32 * brickSize,
    //   32 * brickSize,
    //   32 * brickSize
    // )
    drawStuds(context, brickSize, spacer, size * row, size * col, size, size)
  }

  drawTile(0, 0)
  drawTile(0, 1)
  drawTile(0, 2)
  drawTile(1, 0)
  drawTile(1, 1)
  drawTile(1, 2)
  drawTile(2, 0)
  drawTile(2, 1)
  drawTile(2, 2)

  if (optimalBricks) {
    for (let i = 0, l = optimalBricks.length; i < l; i++) {
      // if (!optimalBricks[i].ignore) {
      let xCount = optimalBricks[i].x + offsetX
      let yCount = optimalBricks[i].y + offsetY
      context.fillStyle = optimalBricks[i].colour
      // if (Color(optimalBricks[i].colour).light()) {
      context.strokeStyle = '#000000'
      // } else {
      //     context.strokeStyle = '#ffffff'
      // }
      context.fillRect(
        xCount * brickSize + spacer,
        yCount * brickSize + spacer,
        optimalBricks[i].width * brickSize - spacer * 2,
        optimalBricks[i].height * brickSize - spacer * 2
      )
      context.strokeRect(
        xCount * brickSize + spacer,
        yCount * brickSize + spacer,
        optimalBricks[i].width * brickSize - spacer * 2,
        optimalBricks[i].height * brickSize - spacer * 2
      )

      context.fillStyle = Color(optimalBricks[i].colour).lighten(0.1)
      drawStuds(
        context,
        brickSize,
        spacer,
        xCount,
        yCount,
        optimalBricks[i].width,
        optimalBricks[i].height
      )
      // }
    }
    let ratio = imageWidth / imageHeight
    let isLandscape = ratio > 1
    let xPos = 0
    let yPos = 0
    if (!isLandscape) {
      xPos = ((imageHeight - imageWidth) / 2) * (outputCanvas.height / height)
    } else {
      yPos = ((imageWidth - imageHeight) / 2) * (outputCanvas.height / height)
    }
    outputContext.drawImage(canvas, xPos, yPos)
  }
}

function drawStuds(ctx, brickSize, spacer, xCount, yCount, width, height) {
  for (var i = 0, l = width; i < l; i++) {
    for (var j = 0, jl = height; j < jl; j++) {
      ctx.beginPath()
      ctx.arc(
        (xCount + i) * brickSize + -spacer / 2 + brickSize / 2,
        (yCount + j) * brickSize + -spacer / 2 + brickSize / 2,
        brickSize * 0.3,
        0,
        2 * Math.PI
      )
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
    }
  }
}
