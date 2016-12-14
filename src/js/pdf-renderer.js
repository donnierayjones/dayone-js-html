
export default class PDFRenderer {
  constructor(entries) {
    this.entries = entries
    this.pageSize = { width: 594, height: 693 };
    this.pageOrientation = 'landscape',
    this.entryMargin = this.pageSize.height * .05;
  }

  render(filename) {
    var docDefinition = {
      pageSize: this.pageSize,
      pageOrientation: this.pageOrientation,
      pageMargins: [0, 0, 0, 0],
      content: []
    };

    this.entries.forEach((entry, i) => {
      docDefinition.content.push(this.entryContainer(entry, i));
    });

    pdfMake.createPdf(docDefinition).download(filename);
  }

  entryContainer(entry, entryIndex) {
    var columns = [];
    var text = [];
    var entryText = entry.textWithoutInlinePhotos();
    var fontSize = this.getFontSize(entryText);

    text.push({
      text: entry.creationDate().toUpperCase(),
      fontSize: fontSize * 0.75,
      color: '#399FC3',
      margin: [0, 0, 0, this.entryMargin / 3]
    });

    text.push({
      text: entryText,
      fontSize: fontSize
    });

    var textColumn = {
      stack: text,
      width: entry.hasPhoto() ? '50%' : '75%',
      margin: [this.entryMargin, this.entryMargin, this.entryMargin, 0]
    };

    var photoColumn = {};

    if(entry.hasPhoto()) {
      photoColumn = {
        image: entry.photos()[0].base64URL,
        fit: [this.pageSize.height / 2, this.pageSize.width / 2 - this.entryMargin * 2],
        alignment: 'center',
        margin: [0, this.entryMargin, 0, this.entryMargin]
      };
    } else {
      photoColumn = {
        image: this.blankImage(),
        height: this.pageSize.width / 2,
        width: this.pageSize.height / 4
      };
    }

    // used to force 50% height on all entries
    var paddingColumn = {
        image: this.blankImage(),
        height: this.pageSize.width / 2,
        width: 1
    };

    if((Math.floor(entryIndex / 2.0)) % 2 == 1) {
      columns.push(textColumn);
      columns.push(paddingColumn);
      columns.push(photoColumn);
    } else {
      columns.push(photoColumn);
      columns.push(paddingColumn);
      columns.push(textColumn);
    }

    var entryDefinition = {
      columns: columns,
      columnGap: 0
    };

    if(entryIndex != 0 && entryIndex % 2 == 1) {
      entryDefinition['pageBreak'] = 'after';
    }

    return entryDefinition;
  }

  getFontSize(text) {
    return this.pageSize.height / 60;
  }

  blankImage() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
}
