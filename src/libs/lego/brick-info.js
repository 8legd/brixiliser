import colours from './data/available-lego-brick-colours'

const getInfoForColour = (hex) => {
  let rtn = {
    name: '? ' + hex,
    hex: hex
  }

  colours.forEach((entry) => {
    if (entry.hex === hex) {
      rtn = entry
    }
  })

  return rtn
}

export default getInfoForColour
