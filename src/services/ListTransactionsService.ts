import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Response {
  transactions: Transaction[];
  balance: Balance;
}

class ListTransactionsService {
  /**
   * execute
   */
  public async execute(): Promise<Response> {
    const transactionsRepository = getRepository(Transaction);
    const transactions = await transactionsRepository.find({
      relations: ['category'],
    });

    let income = 0;
    let outcome = 0;
    transactions.forEach(transaction => {
      // eslint-disable-next-line no-param-reassign
      delete transaction.category_id;
      if (transaction.type === 'income') {
        income += Number(transaction.value);
      } else if (transaction.type === 'outcome') {
        outcome += Number(transaction.value);
      }
    });

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return { transactions, balance };
  }
}

export default ListTransactionsService;
