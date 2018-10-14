import React from 'react'

import Layout from '../components/Layout'
import LegoRenderer from '../components/LegoRenderer'

const SecondPage = () => (
  <Layout>
    <LegoRenderer sourceData={require('../images/christmas-tree.png')} />
  </Layout>
)

export default SecondPage
