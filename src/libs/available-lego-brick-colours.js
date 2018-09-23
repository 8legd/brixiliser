import platesData from '../data/plates.json'
import colours from '../data/colours.json'

const uniqueColours = getUniqueColours()

const filteredColours = colours.filter(colour => {
  return uniqueColours.indexOf(colour.name.toLowerCase()) !== -1
})

export default filteredColours

function getUniqueColours() {
  let uniqueColours = []
  platesData.map(plate => {
    if (uniqueColours.indexOf(plate['Exact Colour'] !== -1)) {
      uniqueColours.push(plate['Exact Colour'].toLowerCase())
    }
  })
  return uniqueColours
}
