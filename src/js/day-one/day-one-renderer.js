import $ from 'jquery';
import {PlistParser} from 'plist-parser';
import _ from 'lodash';
import DayOneDatabase from './day-one-database';
import DayOneEntry from './day-one-entry';

export default class DayOneRenderer {

  constructor(opt) {
    opt = opt || {};
    this.fileSelector = opt.fileSelector || '#fileSelector';
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

    if(dayOneFolder.isDirectory === false || dayOneFolder.name.startsWith('Export') === false) {
      setTimeout(() => {
        this.showInvalidFileAlert();
      }, 100);
      return;
    }

    this.dayOneFolder = dayOneFolder;

    this.showProgress();

    this.initDatabase(() => {
      this.hideProgress();
      this.render();
    }, (progressText, progressPercent) => {
      this.setProgress(progressText, progressPercent);
    });
  }

  initDatabase(onComplete) {
    this.dayOneFolder.getDirectory('photos', null, (photosFolder) => {
      this.dayOneFolder.getFile('Journal.json', null, (fileEntry) => {
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
