import 'bootstrap/dist/css/bootstrap.css';
import './../css/style.css';
import React from 'react';
import {render} from 'react-dom';
import JournalApp from './components/journal-app';
import DayOneRenderer from './day-one/day-one-renderer';
import $ from 'jquery';

require('script!./../../bower_components/pdfmake/build/pdfmake.min.js');
require('script!./../../bower_components/pdfmake/build/vfs_fonts.js');

var renderer = new DayOneRenderer({
  fileSelector: '#fileSelector',
  dragAndDropSelector: 'body',
  renderTargetSelector: '#dayOneRenderTarget'
});

renderer.init(function() {
  render(
    <JournalApp renderer={renderer} />,
    document.getElementById('dayOneRenderTarget')
  );
});

$('.js-app-container').fadeIn();
