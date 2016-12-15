import $ from 'jquery';
import {PlistParser} from 'plist-parser';
import _ from 'lodash';
import DayOneDatabase from './day-one-database';
import DayOneEntry from './day-one-entry';

export default class DayOneRenderer {

  constructor(opt) {
    opt = opt || {};
    this.fileSelector = opt.fileSelector || '#fileSelector';
    this.journalSelector = opt.journalSelector || '#journalSelector';
    this.dragAndDropSelector = opt.dragAndDropSelector || 'body';
    this.renderTargetSelector = opt.renderTargetSelector || '#dayOneRenderTarget';

    this.$progressContainer = $('.js-progress');
    this.$progressBarTitle = $('.js-progress-title');

    this.database = {}
  }

  init(renderCallback) {
    this.renderCallback = renderCallback;
    $(this.dragAndDropSelector).on('drop', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.handleFileSelect(e.originalEvent.dataTransfer.items);
    }).on('dragover dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  showInvalidFileAlert() {
    $('.js-invalid-dayone-file-alert').removeClass('hidden');
  }

  hideInvalidFileAlert() {
    $('.js-invalid-dayone-file-alert').addClass('hidden');
  }

  handleFileSelect(files) {
    this.hideInvalidFileAlert();

    if(files.length === 0) {
      this.showInvalidFileAlert();
      return;
    };

    var dayOneFolder = files[0].webkitGetAsEntry();

    if(dayOneFolder.isDirectory == false || this.isDroppedFileDayOneExport(dayOneFolder) === false) {
      setTimeout(() => {
        this.showInvalidFileAlert();
      }, 100);
      return;
    }

    this.getJournalFiles(dayOneFolder)
      .then((journalFiles) => this.showJournalSelection(journalFiles));

    this.dayOneFolder = dayOneFolder;
  }

  isDroppedFileDayOneExport(dayOneFolder) {
    this.getJournalFiles(dayOneFolder)
      .then((journalFiles) => {
        return journalFiles.length > 0;
      });
  }

  showJournalSelection(journalFiles) {
    if(journalFiles.length != 1) {
      var $journalSelector = $(this.journalSelector);
      var $select = $('select', $journalSelector);
      $select.on('change', () => {
        var journalValue = $select.val();
        if(journalValue !== '') {
          $journalSelector.modal('hide');
          this.selectJournal(journalValue);
        }
      });
      $select.find('option').remove();
      $select.append($('<option>', { value: '', text: 'Select...' }));
      journalFiles.forEach(function(e) {
        $select.append($('<option>', { value: e.name, text: e.name.substr(0, e.name.length - 5)}));
      });
      $journalSelector.modal();
    }
    else {
      this.selectJournal(journalFiles[0].name);
    }
  }

  selectJournal(journalFile) {
    this.showProgress();

    this.initDatabase(journalFile, () => {
      this.hideProgress();
      this.render();
    }, (progressText, progressPercent) => {
      this.setProgress(progressText, progressPercent);
    });
  };

  getJournalFiles(directory) {
    let dirReader = directory.createReader();
    let entries = [];

    var promise = new Promise(function(resolve, reject) {
      dirReader.readEntries(function(results) {
        if (results.length) {
          results.forEach(function(e) {
            if(e.name.endsWith('.json')) {
              entries.push(e);
            }
          });
        }

        resolve(entries);
      }, function(error) {
        /* handle error -- error is a FileError object */
        reject(error);
      });
    });

    return promise;
  }

  initDatabase(journalFile, onComplete) {
    this.dayOneFolder.getDirectory('photos', null, (photosFolder) => {
      this.dayOneFolder.getFile(journalFile, null, (fileEntry) => {
        fileEntry.file((file) => {
          var fileReader = new FileReader();
          fileReader.onload = () => {
            var journalJson = JSON.parse(fileReader.result);
            this.database = new DayOneDatabase(journalJson, photosFolder);
            onComplete();
          };
          fileReader.readAsText(file);
        });
      });
    });
  }

  showProgress() {
    this.$progressContainer.removeClass('hidden');
    this.setProgress('Loading entries...');
  }

  hideProgress() {
    this.$progressContainer.addClass('hidden');
    this.setProgress('');
  }

  setProgress(title) {
    this.$progressBarTitle.text(title);
  }

  render() {
    var $target = $(this.renderTargetSelector);
    $(this.fileSelector).hide();
    $target.show();

    if(this.renderCallback)
      this.renderCallback();
  }
}
