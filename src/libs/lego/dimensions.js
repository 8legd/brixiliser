import platesData from './data/plates.json'
import coloursData from './data/available-lego-brick-colours'

const dimensions = platesData
  .filter(brick => {
    return /^PLATE\s([0-9]*)X([0-9]*)$/gi.test(brick.Name)
  })
  .map(brick => {
    let matches = /^PLATE\s([0-9]*)X([0-9]*)$/gi.exec(brick.Name)
    let data = coloursData.filter(colour => {
      return brick['Exact Colour'].toLowerCase() === colour.name.toLowerCase()
    })[0]
    let hex = data !== undefined ? data.hex : undefined
    return [matches[1], matches[2], hex]
  })

export default dimensions
