import $ from 'jquery';
import {PlistParser} from 'plist-parser';
import _ from 'lodash';
import DayOneEntry from './day-one-entry';

export default class DayOneRenderer {

  constructor(opt) {
    opt = opt || {};
    this.entries = {};
    this.fileSelector = opt.fileSelector || '#fileSelector';
    this.dragAndDropSelector = opt.dragAndDropSelector || 'body';
    this.renderTargetSelector = opt.renderTargetSelector || '#dayOneRenderTarget';

    this.$progressContainer = $('.js-progress');
    this.$progressBar = $('.js-progress-bar');
    this.$progressBarTitle = $('.js-progress-title');
  }

  init(renderCallback) {
    var _this = this;
    this.renderCallback = renderCallback;
    $(this.dragAndDropSelector).on('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();
      _this.handleFileSelect(e.originalEvent.dataTransfer.items);
    }).on('dragover dragenter', function(e) {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  addEntry(dayOneEntry) {
    this.entries[dayOneEntry.UUID()] = dayOneEntry;
  }

  getEntries() {
    return _.sortBy(_.values(this.entries), function(e) {
      return e.creationDateNumeric();
    });
  }

  getTags() {
    return _.uniq(_.flatten(_.map(this.entries, function(entry) {
      return entry.tags();
    }))).sort();
  }

  showInvalidFileAlert() {
    $('.js-invalid-dayone-file-alert').removeClass('hidden');
  }

  hideInvalidFileAlert() {
    $('.js-invalid-dayone-file-alert').addClass('hidden');
  }

  handleFileSelect(files) {
    var _this = this;
    this.entries = {};

    this.hideInvalidFileAlert();

    if(files.length === 0) {
      this.showInvalidFileAlert();
      return;
    };

    var dayOneFolder = files[0].webkitGetAsEntry();

    if(dayOneFolder.isDirectory === false || dayOneFolder.name.endsWith('.dayone') === false) {
      setTimeout(function() {
        _this.showInvalidFileAlert();
      }, 100);
      return;
    }

    this.showProgress();

    this.loadEntries(dayOneFolder, function() {
      _this.hideProgress();
      _this.render();
    }, function(progressText, progressPercent) {
      _this.setProgress(progressText, progressPercent);
    });
  }

  showProgress() {
    this.$progressContainer.removeClass('hidden');
    this.setProgress('Loading...', 0);
  }

  hideProgress() {
    this.$progressContainer.addClass('hidden');
    this.setProgress('', 0);
  }

  setProgress(title, percent) {
    this.$progressBarTitle.text(title);
    $('span', this.$progressBar).text(percent + '% Complete');
    this.$progressBar.css('width', percent + '%');
  }

  loadEntries(dayOneFolder, onComplete, onProgress) {
    var _this = this;
    dayOneFolder.getDirectory('entries', null, function(entriesDirectory) {
      var directoryReader = entriesDirectory.createReader();
      var allEntries = [];
      var processEntries = function() {
        var entryCount = allEntries.length;
        var entriesProcessed = 0;
        var onEntryTextLoaded = function(text) {
          var parser = new PlistParser(text);
          var plistData = parser.parse();
          _this.addEntry(new DayOneEntry(plistData));
        };

        allEntries.forEach(function(entry) {
          entry.file(function(file) {
            var fileReader = new FileReader();
            fileReader.onload = function() {
              onEntryTextLoaded(fileReader.result);
              entriesProcessed++;
              onProgress('Loading entries...', Math.round(entriesProcessed * 100 / entryCount));
              if(entriesProcessed == entryCount) {
                _this.loadPhotos(dayOneFolder, onComplete, onProgress);
              }
            };
            setTimeout(function() {
              fileReader.readAsText(file, 'UTF-8');
            }, Math.random() * 10 * allEntries.length);
          });
        });
      };
      var readEntries = function() {
        directoryReader.readEntries(function(entries) {
          if(entries.length == 0) {
            processEntries(allEntries);
          }
          else
            {
              allEntries = allEntries.concat(entries);
              readEntries();
            }
        });
      };
      readEntries();
    });
  }

  loadPhotos(dayOneFolder, onComplete, onProgress) {
    var _this = this;
    dayOneFolder.getDirectory('photos', null, function(photosDirectory) {
      var directoryReader = photosDirectory.createReader();
      var allPhotos = [];
      var processPhotos = function(photos) {
        var photosProcessed = 0;
        if(photos.length === 0) {
          onComplete();
        }
        photos.forEach(function(photo) {
          photo.file(function(file) {
            var fileName = file.name.substring(0, 32);

            var dataURL = URL.createObjectURL(file);
            var entry = _this.entries[fileName];

            if(entry === undefined) {
              console.log(fileName + ' is not in the entries list.');
              console.log('entry count: ' + Object.keys(_this.entries).length);
            }
            else{
              entry.setPhotoDataURL(dataURL);
            }

            photosProcessed++;

            onProgress('Loading photos...', Math.round(photosProcessed * 100 / photos.length));

            if(photosProcessed === photos.length) {
              onComplete();
            }
          });
        });
      };
      var readPhotos = function() {
        directoryReader.readEntries(function(photos) {
          if(photos.length === 0) {
            processPhotos(allPhotos);
          }
          else {
            allPhotos = allPhotos.concat(photos);
            readPhotos();
          }
        });
      };
      readPhotos();
    });
  }

  render(callback) {
    var $target = $(this.renderTargetSelector);
    $(this.fileSelector).hide();
    $target.show();

    if(this.renderCallback)
      this.renderCallback(this.getEntries(), this.getTags());
  }
}
