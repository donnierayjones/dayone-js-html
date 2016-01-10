import marked from 'marked';
import moment from 'moment';

export default class DayOneEntry {
  constructor(plistData) {
    this.data = plistData;
    this.photoDataURL = '';
    this.shrinkedPhotoDataURL = '';
  }

  get(key) {
    return this.data[key];
  }

  UUID() {
    return this.get('UUID');
  }

  creationDateNumeric() {
    return new Date(this.get('Creation Date')).getTime();
  }

  creationDateTime() {
    return moment(new Date(this.get('Creation Date')));
  }

  creationDate() {
    return this.creationDateTime().format('MMMM Do YYYY');
  }

  creationTime() {
    return this.creationDateTime().format('h:mm a');
  }

  text() {
    return marked(this.get('Entry Text'));
  }

  tags() {
    return _.filter(this.get('Tags'), function(t) { return t !== undefined; });
  }

  hasPhoto() {
    return this.photoDataURL != '';
  }

  hasShrinkedPhoto() {
    return this.shrinkedPhotoDataURL != '';
  }

  setPhotoDataURL(dataURL) {
    this.photoDataURL = dataURL;
  }

  getPhotoDataURL() {
    return this.photoDataURL;
  }

  getShrinkedPhotoDataURL() {
    return this.shrinkedPhotoDataURL;
  }

  shrinkPhoto(callback) {
    var img = document.createElement("img");
    var _this = this;

    if(this.hasShrinkedPhoto()) {
      callback(this.getShrinkedPhotoDataURL());
      return;
    }

    img.src = this.photoDataURL;
    img.onload = function() {
      var maxWidth = 2048; // Any higher than this seems to render black images sometimes?
      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      var width = img.width;
      var height = img.height;

      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      _this.shrinkedPhotoDataURL = canvas.toDataURL("image/jpeg");
      callback(_this.shrinkedPhotoDataURL);
    };
  }
}
