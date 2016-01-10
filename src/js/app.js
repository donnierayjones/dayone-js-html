import 'bootstrap/dist/css/bootstrap.css';
import './../css/style.css';
import React from 'react';
import {render} from 'react-dom';
import JournalApp from './components/journal-app';
import DayOneRenderer from './day-one/day-one-renderer';
import $ from 'jquery';

var renderer = new DayOneRenderer({
  fileSelector: '#fileSelector',
  dragAndDropSelector: 'body',
  renderTargetSelector: '#dayOneRenderTarget'
});

renderer.init(function(entries, tags) {
  render(
    <JournalApp entries={entries} tags={tags} renderer={renderer} />,
    document.getElementById('dayOneRenderTarget')
  );
});

$('.js-app-container').fadeIn();
