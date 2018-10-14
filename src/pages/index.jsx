import React from 'react'
import { connect } from 'react-redux'

import Layout from '../components/layout'
import LegoRenderer from '../components/LegoRenderer'

const mapStateToProps = (state, props) => {
  return {
    ...props,
    sourceData: state.imageURL,
  }
}

const mapDispatchToProps = dispatch => {
  // console.log(dispatch);
  return {
    // sourceData:
    // addCount: bindActionCreators(addCount, dispatch)
    // setImageData: bindActionCreators(setImageData, dispatch),
  }
}

const ConnectedRenderer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LegoRenderer)

const IndexPage = () => (
  <Layout>
    <ConnectedRenderer />
  </Layout>
)

export default IndexPage
