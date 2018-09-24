import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import LegoRenderer from '../components/LegoRenderer'

// const imageData = require('../images/sprites/pokemon/3.png')
// console.log(imageData)

const IndexPage = () => {
  // console.log('imageData', imageData)
  return (
    <Layout>
      <LegoRenderer /*sourceData={imageData}*/ />
      {/* <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <Link to="/page-2/">Go to page 2</Link> */}
    </Layout>
  )
}

export default IndexPage
