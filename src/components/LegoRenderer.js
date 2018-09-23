import React, { Component } from 'react'
import MeasureIt from 'react-measure-it'
import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { setImageData } from '../store'

import { remapPixelColours } from '../libs/colour-utils'
import { convertURIToImageData, scaleImageData } from '../libs/image-utils'

class LegoRenderer extends Component {
  state = {
    dimensions: {
      width: -1,
      height: -1,
    },
  }

  componentDidMount() {
    this.updateCanvas()
  }

  componentDidUpdate() {
    this.updateCanvas()
  }

  updateCanvas() {
    convertURIToImageData(this.props.sourceData).then(originalImageData => {
      // setImageData(originalImageData);
      const canvas = this.refs.canvas
      const ctx = this.refs.canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false

      let { imageData } = remapPixelColours(originalImageData)
      // let imageData = originalImageData

      const pixelScaler = Math.floor(
        this.props.containerWidth / originalImageData.width
      )
      this.setState({
        dimensions: {
          width: originalImageData.width * pixelScaler,
          height: originalImageData.height * pixelScaler,
        },
      })

      const scaledImageData = scaleImageData(ctx, imageData, pixelScaler)

      ctx.putImageData(scaledImageData, 0, 0)
    })
  }

  render() {
    return (
      <div className={this.props.className}>
        <canvas
          ref="canvas"
          width={this.state.dimensions.width}
          height={this.state.dimensions.height}
        />
        <style>{`
          div {
            display: flex;
            flex: 1;
            justify-content: center;
            flex-direction: column;
          }

          canvas {
            width: 100%;
            height: 100%;
            background: white;
          }
        `}</style>
      </div>
    )
  }
}

const mapStateToProps = state => {
  // console.log('imageURL', state)
  return {
    sourceData: state.imageURL,
  }
}

const mapDispatchToProps = dispatch => {
  // console.log(dispatch);
  return {
    // addCount: bindActionCreators(addCount, dispatch)
    // setImageData: bindActionCreators(setImageData, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MeasureIt()(LegoRenderer))

// export default MeasureIt()(LegoRenderer);
