let DATE_COLOR = '#399FC3';
let DATE_FONT_SIZE = '8';
let ENTRY_MARGIN = 0.05;
let TEXT_WIDTH_W_PHOTO = 0.50;
let TEXT_WIDTH_WO_PHOTO = 0.75;
let AUTO_BOLD_FIRST_LINE = true;
let AUTO_BOLD_LINE_MAX_LENGTH = 50;
let PAGE_WIDTH = 594;
let PAGE_HEIGHT = 693;
let PAGE_ORIENT = 'landscape';
let FONT = 'Lora';

export default class PDFRenderer {
  constructor(entries) {
    this.entries = entries
    this.pageSize = { width: PAGE_WIDTH, height: PAGE_HEIGHT };
    this.pageOrientation = PAGE_ORIENT,
    this.entryMargin = this.pageSize.width * ENTRY_MARGIN;

    pdfMake.fonts = {
      lato: {
        normal: 'Lato-Regular.ttf',
        bold: 'Lato-Bold.ttf',
        italics: 'Lato-Italic.ttf',
        bolditalics: 'Lato-BoldItalic.ttf'
      },
      lora: {
        normal: 'Lora-Regular.ttf',
        bold: 'Lora-Bold.ttf',
        italics: 'Lora-Italic.ttf',
        bolditalics: 'Lora-BoldItalic.ttf'
      }
    };
  }

  getPageWidth() {
    if(this.pageOrientation == 'landscape') {
      return this.pageSize.height;
    }
    return this.pageSize.width;
  }

  getPageHeight() {
    if(this.pageOrientation == 'landscape') {
      return this.pageSize.width;
    }
    return this.pageSize.height;
  }

  render(filename) {
    var docDefinition = {
      pageSize: this.pageSize,
      pageOrientation: this.pageOrientation,
      pageMargins: [0, 0, 0, 0],
      defaultStyle: {
        font: 'lato'
      },
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
    var textWidth = entry.hasPhoto() ? TEXT_WIDTH_W_PHOTO : TEXT_WIDTH_WO_PHOTO;
    var textContainerWidth = textWidth * this.getPageWidth() - (this.entryMargin*2);
    var fontSize = this.getFontSize(entryText, textContainerWidth);

    text.push({
      text: entry.creationDate().toUpperCase(),
      fontSize: DATE_FONT_SIZE,
      color: DATE_COLOR,
      margin: [0, this.entryMargin * -0.5, 0, this.entryMargin * 0.25]
    });

    var firstLine = this.getFirstLine(entryText);

    if(AUTO_BOLD_FIRST_LINE && firstLine) {
      text.push({
        text: firstLine,
        fontSize: fontSize + 2,
        bold: true,
        margin: [0, 0, 0, this.entryMargin * 0.15],
        font: 'lora'
      });
      text.push({
        text: this.get2ndLineAndBeyond(entryText),
        fontSize: fontSize
      });
    } else {
      text.push({
        text: entryText,
        fontSize: fontSize
      });
    }

    var textColumn = {
      stack: text,
      height: this.entryHeight(),
      width: textContainerWidth
    };

    // separate text and photos
    var marginColumn = {
      image: this.blankImage(),
      height: this.entryHeight(),
      width: this.entryMargin
    };

    var photoColumn = {
      image: this.blankImage(),
      height: this.entryHeight(),
      width: this.getPageWidth() * (1-textWidth)
    };

    if(entry.hasPhoto()) {
      photoColumn = {
        image: entry.photos()[0].base64URL,
        fit: [this.getPageWidth() * (1-textWidth), this.entryHeight()],
        alignment: 'center',
      };
    }

    if((Math.floor(entryIndex / 2.0)) % 2 == 1) {
      columns.push(marginColumn);
      columns.push(textColumn);
      columns.push(marginColumn);
      columns.push(photoColumn);
    } else {
      columns.push(photoColumn);
      columns.push(marginColumn);
      columns.push(textColumn);
      columns.push(marginColumn);
    }

    columns.forEach((c) => {
      c.margin = [0, this.entryMargin, 0, 0];
    });

    var entryDefinition = {
      columns: columns,
      columnGap: 0
    };

    if(entryIndex != 0 && entryIndex % 2 == 1) {
      entryDefinition['pageBreak'] = 'after';
    }

    return entryDefinition;
  }

  getFontSize(text, textContainerWidth) {
    return this.calculateFontSize(
      text,
      textContainerWidth,
      this.entryHeight());
  }

  calculateFontSize(text, width, height) { 
    let min = 2;
    let max = 16;
    var fontSize = min;
    let container = $('.js-font-size-container')
      .show()
      .css('width', width + 'pt')
      .css('font-family', FONT)
      .text(text);

    do {
      container.css('fontSize', fontSize + 'pt');
      fontSize = fontSize + 1;
      if(fontSize >= max + 1) {
        break;
      }
    } while ((container.height()*72/96) <= height);

    return fontSize - 1;
  };

  entryHeight() {
    return (this.getPageHeight() / 2) - (this.entryMargin * 2);
  }

  blankImage() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }

  getFirstLine(entryText) {
    var firstLine = (entryText.split("\n") || [''])[0];

    if (firstLine.length < AUTO_BOLD_LINE_MAX_LENGTH) {
      return firstLine;
    }
  }

  get2ndLineAndBeyond(entryText) {
    var lines = entryText.split("\n") || [''];
    lines.shift();
    return lines.join("\n").trim();
  }
}
