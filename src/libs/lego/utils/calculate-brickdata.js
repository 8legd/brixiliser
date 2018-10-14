export default function calculateBrickData(brickData) {
  // console.log('calculateBrickData')
  let rolledUpBricks = {}

  brickData.map(brick => {
    // if (!brick.ignore) {
    let largest = brick.width > brick.height ? brick.width : brick.height
    let smallest = brick.width < brick.height ? brick.width : brick.height
    if (!rolledUpBricks[brick.colour]) {
      rolledUpBricks[brick.colour] = {}
    }
    let entry = rolledUpBricks[brick.colour]
    if (!entry[`${largest}x${smallest}`]) {
      entry[`${largest}x${smallest}`] = 0
    }
    entry[`${largest}x${smallest}`]++
    // }
  })

  return rolledUpBricks
}
