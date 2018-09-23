import React, { Component } from 'react'
// import MeasureIt from 'react-measure-it'
import { withContentRect } from 'react-measure'

import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import { setImageData } from '../store'

import { remapPixelColours } from '../libs/colour-utils'
import { convertURIToImageData, scaleImageData } from '../libs/image-utils'

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
    console.log('componentDidMount')
    this.updateCanvas()
  }

  // componentDidUpdate() {
  //   this.updateCanvas()
  // }

  componentDidUpdate(prevProps) {
    console.log(
      'componentDidUpdate',
      this.props.sourceData !== prevProps.sourceData
    )
    // if (this.props.sourceData !== prevProps.sourceData) {
    this.updateCanvas()
    // }
  }

  updateCanvas() {
    console.log('updateCanvas', this.props.sourceData)
    if (!this.props.sourceData) {
      console.error('sourceData is undefined')
      return
    }
    convertURIToImageData(this.props.sourceData)
      .then(originalImageData => {
        // setImageData(originalImageData);
        console.log('stuff')

        let { imageData } = remapPixelColours(originalImageData)

        // this.setState({
        //   dimensions: {
        //     width: originalImageData.width * pixelScaler,
        //     height: originalImageData.height * pixelScaler,
        //   },
        // })

        this.drawImageData(this.refs.canvas, imageData)

        this.drawImageData(this.refs.original_canvas, originalImageData)
      })
      .catch(e => {
        console.error(e)
      })
  }

  drawImageData(canvas, imageData) {
    console.log('drawImageData')
    // const canvas =
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    // let imageData = originalImageData

    const pixelScaler = Math.floor(this.props.width / imageData.width)
    // const pixelScaler = this.props.width / imageData.width

    console.log('pixelScaler', pixelScaler)

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
          ref="canvas"
          width={this.props.width}
          height={this.props.height / 2}
        />
        <canvas
          ref="original_canvas"
          width={this.props.width}
          height={this.props.height / 2}
        />
        <style>{`
          div {
            display: flex;
            flex: 1;
            justify-content: center;
            flex-direction: column;
          }

          canvas {
            width: 100vw;
            height: 100vw;
            background: white;
          }
        `}</style>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  // console.log('imageURL', state)
  console.log('props: ', props)
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
      console.log('contentRect.bounds', contentRect.bounds)
      console.log('props', props)
      return (
        <div ref={measureRef}>
          <LegoRenderer {...props} {...contentRect.bounds} />
        </div>
      )
    }
  )
)

// export default MeasureIt()(LegoRenderer);
