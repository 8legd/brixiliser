export default function cropImageFromCanvas(canvas) {
  const ctx = canvas.getContext('2d')
  let w = canvas.width
  let h = canvas.height
  let pix = { x: [], y: [] }

  if (!canvas.width || !canvas.height) return
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let x
  let y
  let index

  for (y = 0; y < h; y++) {
    for (x = 0; x < w; x++) {
      index = (y * w + x) * 4
      if (imageData.data[index + 3] > 0) {
        pix.x.push(x)
        pix.y.push(y)
      }
    }
  }
  pix.x.sort(function(a, b) {
    return a - b
  })
  pix.y.sort(function(a, b) {
    return a - b
  })
  var n = pix.x.length - 1

  w = pix.x[n] - pix.x[0] + 1
  h = pix.y[n] - pix.y[0] + 1
  if (pix.x[0] > 0) {
    x = pix.x[0] - 1
    w += 2
  } else {
    x = 0
  }
  if (pix.y[0] > 0) {
    y = pix.y[0] - 1
    h += 2
  } else {
    y = 0
  }

  if (!w || !h) return
  var cut = ctx.getImageData(x, y, w, h)

  return cut
}
