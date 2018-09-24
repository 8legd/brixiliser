import React, { Component } from 'react'
// import MeasureIt from 'react-measure-it'
import { withContentRect } from 'react-measure'

import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { setImageData } from '../store'

import { remapPixelColours } from '../libs/colour-utils'
import { convertURIToImageData, scaleImageData } from '../libs/image-utils'
import calculateFromImageData from '../libs/lego/calculateOptimalBricks'
import { renderImageDataAsLego } from '../libs/renderLego'
import cropCanvas from '../libs/crop-canvas'

class LegoRenderer extends Component {
  // state = {
  //   // dimensions: {
  //   //   width: -1,
  //   //   height: -1,
  //   // },
  //   // sourceData,
  //   // originalImageData,
  // }

  constructor(props) {
    super(props)
    if (props && props.sourceData) {
      this.updateCanvas()
    }
  }

  componentDidMount() {
    // console.log('componentDidMount')
    this.updateCanvas()
  }

  // componentDidUpdate() {
  //   this.updateCanvas()
  // }

  componentDidUpdate(prevProps) {
    // console.log(
    //   'componentDidUpdate',
    //   this.props.sourceData !== prevProps.sourceData
    // )
    // if (this.props.sourceData !== prevProps.sourceData) {
    this.updateCanvas()
    // }
  }

  updateCanvas() {
    // console.log('updateCanvas', this.props.sourceData)
    if (!this.props.sourceData) {
      console.error('sourceData is undefined')
      return
    }
    convertURIToImageData(this.props.sourceData).then(originalImageData => {
      // setImageData(originalImageData);
      // console.log('stuff')

      let { imageData } = remapPixelColours(originalImageData)

      // this.setState({
      //   dimensions: {
      //     width: originalImageData.width * pixelScaler,
      //     height: originalImageData.height * pixelScaler,
      //   },
      // })

      // const croppedImage = cropCanvas(imageData)
      // if (imageData) {
      // const calculator = new CalculateOptimalBricks()

      // if (imageData) {
      if (!imageData) return
      this.refs.offscreen_canvas.width = imageData.width
      this.refs.offscreen_canvas.height = imageData.height
      // this.drawImageData(this.refs.offscreen_canvas, imageData)
      const ctx = this.refs.offscreen_canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false

      const scaledImageData = scaleImageData(ctx, imageData, 1)
      ctx.putImageData(scaledImageData, 0, 0)
      // }

      this.drawImageData(this.refs.canvas, imageData)

      // this.drawImageData(this.refs.offscreen_canvas, imageData)
      // this.refs.offscreen_canvas.getContext('2d').putImageData(imageData, 0, 0)
      const cropped = cropCanvas(this.refs.offscreen_canvas)
      // console.log(cropped.width, cropped.height)
      // console.log(cropped)
      const largestValue =
        cropped.width > cropped.height ? cropped.width : cropped.height
      const tiles = Math.ceil(largestValue / 32)

      this.drawImageData(this.refs.original_canvas, originalImageData)

      // const optimalData = calculateFromImageData(scaledImageData)
      const optimalData = calculateFromImageData(cropped)
      // console.log('optimalData', optimalData)

      renderImageDataAsLego(
        this.refs.canvas_lego,
        // this.props.height,
        // 264,
        optimalData,
        32 * tiles,
        32 * tiles,
        Math.floor((32 * tiles - cropped.width) / 2),
        Math.floor((32 * tiles - cropped.height) / 2)
        // this.props.width,s
        // this.props.height
      )
      // }
    })
    // .catch(e => {
    //   console.error(e)
    // })
  }

  drawImageData(canvas, imageData) {
    // console.log('drawImageData')
    // const canvas =
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    // let imageData = originalImageData

    const pixelScaler = Math.floor(this.props.width / imageData.width)
    // const pixelScaler = this.props.width / imageData.width

    // console.log('pixelScaler', pixelScaler)

    // this.setState({
    //   dimensions: {
    //     width: imageData.width * pixelScaler,
    //     height: imageData.height * pixelScaler,
    //   },
    // })

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
          <canvas
            ref="canvas"
            width={this.props.width}
            height={this.props.width}
          />
          <canvas
            ref="original_canvas"
            width={this.props.width}
            height={this.props.width}
          />
          <style>{`
          div.wrapper {
            display: flex;
            flex: 1;
            justify-content: center;
            flex-direction: column;
          }

          .wrapper canvas {
            width: 100vw;
            height: 100vw;
            background: white;
          }
        `}</style>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  // console.log('imageURL', state)
  // console.log('props: ', props)
  return {
    ...props,
    // sourceData: state.imageURL,
  }
}

const mapDispatchToProps = dispatch => {
  // console.log(dispatch);
  return {
    // addCount: bindActionCreators(addCount, dispatch)
    // setImageData: bindActionCreators(setImageData, dispatch),
  }
}

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(MeasureIt()(LegoRenderer))
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withContentRect('bounds')(
    ({ measureRef, measure, contentRect, ...props }) => {
      // console.log('contentRect.bounds', contentRect.bounds)
      // console.log('props', props)
      return (
        <div ref={measureRef}>
          <LegoRenderer {...props} {...contentRect.bounds} />
        </div>
      )
    }
  )
)

// export default MeasureIt()(LegoRenderer);
