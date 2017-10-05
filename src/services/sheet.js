const debug = require('debug')('github-metrics:services:sheet');
const Excel = require('exceljs');

Excel.config.setValue('promise', global.Promise);

const SheetService = {

  read: async (sheet) => {
    debug('reading sheet');

    const workbook = new Excel.Workbook();
    workbook.xlsx.read(sheet);
  },

};

module.exports = SheetService;
