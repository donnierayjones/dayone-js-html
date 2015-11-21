$(function () {
  var DayOneEntry = function (plistData) {
    this.data = plistData;
    this.photoDataURL = '';
    this.shrinkedPhotoDataURL = '';
  };

  DayOneEntry.prototype.get = function (key) {
    return this.data[key];
  };

  DayOneEntry.prototype.UUID = function () {
    return this.get('UUID');
  };

  DayOneEntry.prototype.creationDateNumeric = function () {
    return new Date(this.get('Creation Date')).getTime();
  };

  DayOneEntry.prototype.creationDateTime = function () {
    return moment(new Date(this.get('Creation Date')));
  };

  DayOneEntry.prototype.creationDate = function () {
    return this.creationDateTime().format('MMMM Do YYYY');
  };

  DayOneEntry.prototype.creationTime = function () {
    return this.creationDateTime().format('h:mm a');
  };

  DayOneEntry.prototype.text = function () {
    return marked(this.get('Entry Text'));
  };

  DayOneEntry.prototype.tags = function () {
    return _.filter(this.get('Tags'), function (t) {
      return t !== undefined;
    });
  };

  DayOneEntry.prototype.hasPhoto = function () {
    return this.photoDataURL != '';
  };

  DayOneEntry.prototype.hasShrinkedPhoto = function () {
    return this.shrinkedPhotoDataURL != '';
  };

  DayOneEntry.prototype.setPhotoDataURL = function (dataURL) {
    this.photoDataURL = dataURL;
  };

  DayOneEntry.prototype.getPhotoDataURL = function () {
    return this.photoDataURL;
  };

  DayOneEntry.prototype.getShrinkedPhotoDataURL = function () {
    return this.shrinkedPhotoDataURL;
  };

  DayOneEntry.prototype.shrinkPhoto = function (callback) {
    var img = document.createElement("img");
    var _this = this;

    if (this.hasShrinkedPhoto()) {
      callback(this.getShrinkedPhotoDataURL());
      return;
    }

    img.src = this.photoDataURL;
    img.onload = function () {
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
  };

  var DayOneRenderer = function (opt) {
    opt = opt || {};
    this.entries = {};
    this.fileSelector = opt.fileSelector || '#fileSelector';
    this.dragAndDropSelector = opt.dragAndDropSelector || 'body';
    this.renderTargetSelector = opt.renderTargetSelector || '#dayOneRenderTarget';

    this.$progressContainer = $('.js-progress');
    this.$progressBar = $('.js-progress-bar');
    this.$progressBarTitle = $('.js-progress-title');
  };

  DayOneRenderer.prototype.init = function () {
    var _this = this;
    $(this.dragAndDropSelector).on('drop', function (e) {
      e.stopPropagation();
      e.preventDefault();
      _this.handleFileSelect(e.originalEvent.dataTransfer.items);
    }).on('dragover dragenter', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
  };

  DayOneRenderer.prototype.addEntry = function (dayOneEntry) {
    this.entries[dayOneEntry.UUID()] = dayOneEntry;
  };

  DayOneRenderer.prototype.getEntries = function () {
    return _.sortBy(_.values(this.entries), function (e) {
      return e.creationDateNumeric();
    });
  };

  DayOneRenderer.prototype.getTags = function () {
    return _.uniq(_.flatten(_.map(this.entries, function (entry) {
      return entry.tags();
    }))).sort();
  };

  DayOneRenderer.prototype.showInvalidFileAlert = function () {
    $('.js-invalid-dayone-file-alert').removeClass('hidden');
  };

  DayOneRenderer.prototype.hideInvalidFileAlert = function () {
    $('.js-invalid-dayone-file-alert').addClass('hidden');
  };

  DayOneRenderer.prototype.handleFileSelect = function (files) {
    var _this = this;
    this.entries = {};

    this.hideInvalidFileAlert();

    if (files.length === 0) {
      this.showInvalidFileAlert();
      return;
    };

    var dayOneFolder = files[0].webkitGetAsEntry();

    if (dayOneFolder.isDirectory === false || dayOneFolder.name.endsWith('.dayone') === false) {
      setTimeout(function () {
        _this.showInvalidFileAlert();
      }, 100);
      return;
    }

    this.showProgress();

    this.loadEntries(dayOneFolder, function () {
      _this.hideProgress();
      _this.render();
    }, function (progressText, progressPercent) {
      _this.setProgress(progressText, progressPercent);
    });
  };

  DayOneRenderer.prototype.showProgress = function () {
    this.$progressContainer.removeClass('hidden');
    this.setProgress('Loading...', 0);
  };

  DayOneRenderer.prototype.hideProgress = function () {
    this.$progressContainer.addClass('hidden');
    this.setProgress('', 0);
  };

  DayOneRenderer.prototype.setProgress = function (title, percent) {
    //console.log(title, percent);
    this.$progressBarTitle.text(title);
    $('span', this.$progressBar).text(percent + '% Complete');
    this.$progressBar.css('width', percent + '%');
  };

  DayOneRenderer.prototype.loadEntries = function (dayOneFolder, onComplete, onProgress) {
    var _this = this;
    dayOneFolder.getDirectory('entries', null, function (entriesDirectory) {
      var directoryReader = entriesDirectory.createReader();
      var allEntries = [];
      var processEntries = function () {
        var entryCount = allEntries.length;
        var entriesProcessed = 0;
        var onEntryTextLoaded = function (text) {
          var plistData = PlistParser.parse(text);
          _this.addEntry(new DayOneEntry(plistData));
        };

        allEntries.forEach(function (entry) {
          entry.file(function (file) {
            var fileReader = new FileReader();
            fileReader.onload = function () {
              onEntryTextLoaded(fileReader.result);
              entriesProcessed++;
              onProgress('Loading entries...', Math.round(entriesProcessed * 100 / entryCount));
              if (entriesProcessed == entryCount) {
                _this.loadPhotos(dayOneFolder, onComplete, onProgress);
              }
            };
            setTimeout(function () {
              fileReader.readAsText(file, 'UTF-8');
            }, Math.random() * 10 * allEntries.length);
          });
        });
      };
      var readEntries = function () {
        directoryReader.readEntries(function (entries) {
          if (entries.length == 0) {
            processEntries(allEntries);
          } else {
            allEntries = allEntries.concat(entries);
            readEntries();
          }
        });
      };
      readEntries();
    });
  };

  DayOneRenderer.prototype.loadPhotos = function (dayOneFolder, onComplete, onProgress) {
    var _this = this;
    dayOneFolder.getDirectory('photos', null, function (photosDirectory) {
      var directoryReader = photosDirectory.createReader();
      var allPhotos = [];
      var processPhotos = function (photos) {
        var photosProcessed = 0;
        if (photos.length === 0) {
          onComplete();
        }
        photos.forEach(function (photo) {
          photo.file(function (file) {
            var fileName = file.name.substring(0, 32);

            var dataURL = URL.createObjectURL(file);
            var entry = _this.entries[fileName];

            if (entry === undefined) {
              console.log(fileName + ' is not in the entries list.');
              console.log('entry count: ' + Object.keys(_this.entries).length);
            } else {
              entry.setPhotoDataURL(dataURL);
            }

            photosProcessed++;

            onProgress('Loading photos...', Math.round(photosProcessed * 100 / photos.length));

            if (photosProcessed === photos.length) {
              onComplete();
            }
          });
        });
      };
      var readPhotos = function () {
        directoryReader.readEntries(function (photos) {
          if (photos.length === 0) {
            processPhotos(allPhotos);
          } else {
            allPhotos = allPhotos.concat(photos);
            readPhotos();
          }
        });
      };
      readPhotos();
    });
  };

  DayOneRenderer.prototype.render = function () {
    var $target = $(this.renderTargetSelector);
    $(this.fileSelector).hide();
    $target.show();

    window.DayOne.reactRender(this.getEntries(), this.getTags());
  };

  window.DayOne.renderer = new DayOneRenderer({
    fileSelector: '#fileSelector',
    dragAndDropSelector: 'body',
    renderTargetSelector: '#dayOneRenderTarget'
  });
  window.DayOne.renderer.init();
});