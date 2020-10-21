const du = require('datauri/sync')
// 이미지를 미리 로딩해 둔다, 아니면 이미지를 매번 로딩해서 깜빡거림
function setImagePath(imagePath) {
  return imagePath.map((x) => {
    let img = new Image()
    img.src = du(x.path).content
    return img
  })
}

export default setImagePath