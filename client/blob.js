/*global URL*/

/* dependencies */
import Blob from 'blob';

export default blobToImage;

function blobToImage(imageData) {
  if (Blob && 'undefined' != typeof URL) {
    const blob = new Blob([imageData], {type: 'image/png'});
    return URL.createObjectURL(blob);
  } else if (imageData.base64) {
    return `data:image/png;base64,${imageData.data}`;
  } else {
    return 'about:blank';
  }
}
