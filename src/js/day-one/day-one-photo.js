export default class DayOnePhoto {
  constructor(data, photosFolder) {
    this.data = data;
    this.photosFolder = photosFolder;
    this.isLoaded = false;
    this.dataURL = '';
    this.isBase64Loaded = false;
    this.base64URL = ''
  }

  load(callback) {
    if(this.isLoaded)
      return callback();

    this.photosFolder.getFile(this.MD5() + '.jpeg', null, (fileEntry) => {
      fileEntry.file((file) => {
        this.dataURL = URL.createObjectURL(file);
        this.isLoaded = true;
        callback();
      });
    });
  }

  loadBase64(callback) {
    this.photosFolder.getFile(this.MD5() + '.jpeg', null, (fileEntry) => {
      fileEntry.file((file) => {
        var fileReader = new FileReader();
        fileReader.onload = () => {
          this.base64URL = fileReader.result;
          this.isBase64Loaded = true;
          callback();
        };
        fileReader.readAsDataURL(file);
      });
    });
  }

  MD5() {
    return this.data['md5'];
  }
}
