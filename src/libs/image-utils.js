export const convertURIToImageData = URI => {
  return new Promise(function(resolve, reject) {
    if (URI == null) return reject()
    var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      image = new Image()
    image.addEventListener(
      'load',
      function() {
        canvas.width = image.width
        canvas.height = image.height
        context.drawImage(this, 0, 0, canvas.width, canvas.height)
        resolve(context.getImageData(0, 0, canvas.width, canvas.height))
      },
      false
    )
    image.src = URI
  })
}

export const scaleImageData = (ctx, imageData, scale) => {
  var scaled = ctx.createImageData(
    imageData.width * scale,
    imageData.height * scale
  )
  var subLine = ctx.createImageData(scale, 1).data
  for (var row = 0; row < imageData.height; row++) {
    for (var col = 0; col < imageData.width; col++) {
      var sourcePixel = imageData.data.subarray(
        (row * imageData.width + col) * 4,
        (row * imageData.width + col) * 4 + 4
      )
      for (var x = 0; x < scale; x++) subLine.set(sourcePixel, x * 4)
      for (var y = 0; y < scale; y++) {
        var destRow = row * scale + y
        var destCol = col * scale
        scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4)
      }
    }
  }

  return scaled
}
