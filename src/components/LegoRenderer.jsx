import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withContentRect } from 'react-measure'

import { remapPixelColours } from '../libs/colour-utils'
import { convertURIToImageData, scaleImageData } from '../libs/image-utils'
import calculateFromImageData from '../libs/lego/calculateOptimalBricks'
import { renderImageDataAsLego } from '../libs/renderLego'
import cropCanvas from '../libs/crop-canvas'

class LegoRenderer extends Component {
  constructor(props) {
    super(props)
    if (props && props.sourceData) {
      this.updateCanvas()
    }
  }

  componentDidMount() {
    this.updateCanvas()
  }

  componentDidUpdate() {
    this.updateCanvas()
  }

  updateCanvas() {
    const { sourceData } = this.props

    if (!sourceData) {
      console.error('sourceData is undefined')
      return
    }
    convertURIToImageData(sourceData).then(originalImageData => {
      let { imageData } = remapPixelColours(originalImageData)

      if (!imageData) return
      this.refs.offscreen_canvas.width = imageData.width
      this.refs.offscreen_canvas.height = imageData.height

      const ctx = this.refs.offscreen_canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false

      const scaledImageData = scaleImageData(ctx, imageData, 1)
      ctx.putImageData(scaledImageData, 0, 0)

      const cropped = cropCanvas(this.refs.offscreen_canvas)

      const largestValue =
        cropped.width > cropped.height ? cropped.width : cropped.height
      const tiles = Math.ceil(largestValue / 32)

      const optimalData = calculateFromImageData(cropped)

      renderImageDataAsLego(
        this.refs.canvas_lego,
        optimalData,
        32 * tiles,
        32 * tiles,
        Math.floor((32 * tiles - cropped.width) / 2),
        Math.floor((32 * tiles - cropped.height) / 2)
      )
    })
  }

  drawImageData(canvas, imageData) {
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    const pixelScaler = Math.floor(this.props.width / imageData.width)

    const scaledImageData = scaleImageData(ctx, imageData, pixelScaler)

    ctx.putImageData(scaledImageData, 0, 0)
  }

  render() {
    return (
      <div className={this.props.className}>
        <canvas
          style={{ position: 'absolute', background: 'red', display: 'none' }}
          width={96}
          height={96}
          ref="offscreen_canvas"
        />
        <div className="wrapper">
          <canvas
            ref="canvas_lego"
            width={this.props.width}
            height={this.props.width}
          />
          {/* <canvas
            ref="canvas"
            width={this.props.width}
            height={this.props.width}
          />
          <canvas
            ref="original_canvas"
            width={this.props.width}
            height={this.props.width}
          /> */}
          <style>{`
          div.wrapper {
            display: flex;
            flex: 1;
            justify-content: center;
            flex-direction: column;
          }

          .wrapper canvas {
            width: 48vw;
            height: 48vw;
            margin: 0 auto;
            background: white;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.7);
          }
        `}</style>
        </div>
      </div>
    )
  }
}

LegoRenderer.propTypes = {
  sourceData: PropTypes.string.isRequired,
}

export default withContentRect('bounds')(
  ({ measureRef, measure, contentRect, ...props }) => (
    <div ref={measureRef}>
      <LegoRenderer {...props} {...contentRect.bounds} />
    </div>
  )
)
