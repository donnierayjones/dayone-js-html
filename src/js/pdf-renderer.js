
var imageContainer = (dataUrl) => {
  return {
    image: dataUrl,
    fit: [300, 300]
  };
};

export default class PDFRenderer {
  constructor(entries) {
    this.entries = entries
  }

  render(filename) {
    var docDefinition = {
      pageOrientation: 'landscape',
      content: []
    };

    this.entries.forEach((entry) => {
      docDefinition.content.push(entry.creationDate());

      if(entry.hasLegacyPhoto()) {
        docDefinition.content.push(imageContainer(entry.photos()[0].base64URL));
      };

      if(entry.hasInlinePhotos()) {
        entry.textWithInlinePhotos().forEach((item) => {
          if(item.type == 'text') {
            docDefinition.content.push(item.data);
          } else {
            docDefinition.content.push(imageContainer(item.data.base64URL));
          }
        });
      } else {
        docDefinition.content.push(entry.text());
      }
    });

    pdfMake.createPdf(docDefinition).download(filename);
  }
}
