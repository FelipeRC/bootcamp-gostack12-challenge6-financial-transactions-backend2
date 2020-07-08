import fs from 'fs';
import csv from 'csv-parse';
import path from 'path';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

interface CSVLine {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, filename);
    const fileExists = await fs.promises.stat(filePath);
    if (fileExists) {
      let csvLines = new Array<CSVLine>();
      csvLines = await this.loadCSV(filePath);

      await fs.promises.unlink(filePath);

      const createTransactionService = new CreateTransactionService();

      const transactions = new Array<Transaction>();
      // await new Promise(resolve => {});

      // eslint-disable-next-line no-plusplus
      for (let index = 0; index < csvLines.length; index++) {
        const row = csvLines[index];
        // eslint-disable-next-line no-await-in-loop
        const transaction = await createTransactionService.execute(row);
        transactions.push(transaction);
      }

      return transactions;
    }
    throw new Error('File not found.');
  }

  async loadCSV(filePath: string): Promise<Array<CSVLine>> {
    const csvRows = new Array<CSVLine>();

    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csv({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on('data', row => {
      const [title, type, value, category] = row;
      csvRows.push({
        title,
        type,
        value,
        category,
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return csvRows;
  }
}

export default ImportTransactionsService;
