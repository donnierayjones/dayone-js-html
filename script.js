$(function() {
  var fileSelector = '#fileSelector';
  var dragAndDropSelector = '#dragAndDrop';
  var fileInputSelector = '#fileInput';
  var renderTarget = '#dayOneRenderTarget';

  var DayOneRenderer = function() {
    var _this = this;
    this.loadImageCounter = 0;
    $(dragAndDropSelector).on('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();
      _this.handleFileSelect(e.originalEvent.dataTransfer.files);
    }).on('dragover dragenter', function(e) {
      e.preventDefault();
      e.stopPropagation();
    });

    $(fileInputSelector).on('change', function(e) {
      _this.handleFileSelect(e.target.files);
    });
  };

  DayOneRenderer.prototype.handleFileSelect = function(files)  {
    var _this = this;
    // use a BlobReader to read the zip from a Blob object
    zip.createReader(new zip.BlobReader(files[0]), function(reader) {

      // get all entries from the zip
      reader.getEntries(function(entries) {
        for(var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if(entry.filename.match(/.*\.doentry/)) {
            // get first entry content as text
            entry.getData(new zip.TextWriter(), function(text) {
              // text contains the entry data as a String
              console.log(text);
            });
          }
          if(entry.filename.match(/.*\.jpg/)) {
            _this.loadImageCounter++;
            if(_this.loadImageCounter > 20)
              return;
            entry.getData(new zip.BlobWriter(), function(blob) {
              loadImage(
                  blob,
                  function (img) {
                    if(img.type === "error") {
                      console.log("Error loading image ", entry);
                    } else {
                      document.body.appendChild(img);
                    }
                  }, {
                    maxWidth: 600
                  }
              );
            });
          }
        }
      });
    }, function(error) {
      // onerror callback
      console.log(error);
    });
  };

  window.dayOneRenderer = new DayOneRenderer();
});
