import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withContentRect } from 'react-measure'

import { remapPixelColours } from '../libs/colour-utils'
import { convertURIToImageData, scaleImageData } from '../libs/image-utils'
import calculateFromImageData from '../libs/lego/calculateOptimalBricks'
import renderImageDataAsLego from '../libs/renderLego'
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
    const { sourceData, orientation } = this.props

    if (!sourceData) {
      console.error('sourceData is undefined')
      return
    }

    convertURIToImageData(sourceData)
      .then(originalImageData => {
        const { imageData } = remapPixelColours(originalImageData)
        if (!imageData) throw new Error('No Image Data is defined')

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

        const optimalData = calculateFromImageData({
          imageData: cropped,
          orientation,
        })

        renderImageDataAsLego({
          outputCanvas: this.refs.canvas_lego,
          optimalBricks: optimalData,
          imageWidth: 32 * tiles,
          imageHeight: 32 * tiles,
          offsetX: Math.floor((32 * tiles - cropped.width) / 2),
          offsetY: Math.floor((32 * tiles - cropped.height) / 2),
          orientation,
        })
      })
      .catch(e => {
        console.error(e)
      })
  }

  drawImageData(canvas, imageData) {
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    const { width } = this.props

    const pixelScaler = Math.floor(width / imageData.width)

    const scaledImageData = scaleImageData(ctx, imageData, pixelScaler)

    ctx.putImageData(scaledImageData, 0, 0)
  }

  render() {
    const { className, width, height } = this.props
    return (
      <div className={className}>
        <canvas
          style={{ position: 'absolute', background: 'red', display: 'none' }}
          width={96}
          height={96}
          ref="offscreen_canvas"
        />
        <div className="wrapper">
          <canvas ref="canvas_lego" width={width} height={width} />
          {/* <canvas
            ref="canvas"
            width={width}
            height={width}
          />
          <canvas
            ref="original_canvas"
            width={width}
            height={width}
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
  orientation: PropTypes.oneOf(['topDown', 'sideView']),
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  className: PropTypes.string,
}

LegoRenderer.defaultProps = {
  orientation: 'topDown',
  className: '',
}

export default withContentRect('bounds')(
  ({ measureRef, measure, contentRect, ...props }) => (
    <div ref={measureRef}>
      <LegoRenderer {...props} {...contentRect.bounds} />
    </div>
  )
)
