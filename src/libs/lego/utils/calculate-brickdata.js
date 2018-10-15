export default function calculateBrickData(brickData) {
  const rolledUpBricks = {}

  brickData.forEach(brick => {
    const largest = brick.width > brick.height ? brick.width : brick.height
    const smallest = brick.width < brick.height ? brick.width : brick.height
    if (!rolledUpBricks[brick.colour]) {
      rolledUpBricks[brick.colour] = {}
    }
    const entry = rolledUpBricks[brick.colour]
    if (!entry[`${largest}x${smallest}`]) {
      entry[`${largest}x${smallest}`] = 0
    }
    entry[`${largest}x${smallest}`] = entry[`${largest}x${smallest}`] + 1
  })

  return rolledUpBricks
}
