// import remapPixelColours from './lego/remapPixelColours'
import Color from 'color'

const spacer = 1 //0.25 //1;

// function render() {
//   this.width = this.$el.offsetWidth
//   this.height = this.$el.offsetHeight

//   let optimalBricks = this._props.optimalBricks

//   if (!this._props.optimalBricks) {
//     return
//   }

//   var canvas = this.$refs.canvas
//   let ctx = canvas.getContext('2d')

//   // ctx.imageSmoothingEnabled = false

//   if (!this._props.imagedata || !this._props.imagedata.data) {
//     return
//   }

//   let { imageData } = remapPixelColours(this._props.imagedata)

//   // let optimalBricks = CalculateOptimalBricks.calculateFromImageData(imageData)
//   let width = imageData.width
//   let height = imageData.height
//   // console.log(width, height)
//   let imageSize = width < height ? height : width

//   renderImageDataAsLego(ctx, canvas, imageSize, optimalBricks, width, height)
// }

export function renderImageDataAsLego(
  //   outputContext,
  outputCanvas,
  //   height,
  optimalBricks,
  imageWidth,
  imageHeight
) {
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

  //   context.fillRect(0, 0, 64 * brickSize, 64 * brickSize)
  //   context.strokeRect(0, 0, 32 * brickSize, 32 * brickSize)
  //   context.strokeRect(0, 32 * brickSize, 32 * brickSize, 32 * brickSize)
  //   context.strokeRect(32 * brickSize, 0, 32 * brickSize, 32 * brickSize)
  //   context.strokeRect(
  //     32 * brickSize,
  //     32 * brickSize,
  //     32 * brickSize,
  //     32 * brickSize
  //   )
  //   drawStuds(context, brickSize, spacer, 0, 0, 64, 64)

  if (optimalBricks) {
    for (let i = 0, l = optimalBricks.length; i < l; i++) {
      // if (!optimalBricks[i].ignore) {
      let xCount = optimalBricks[i].x
      let yCount = optimalBricks[i].y
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

// export default render
