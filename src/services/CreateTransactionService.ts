import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import ListTransactionsService from './ListTransactionsService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  /**
   * Create a new Transaction
   *
   * @param param0:Request
   *
   */
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid type Error', 400);
    }

    const listTransactionsService = new ListTransactionsService();

    if (type === 'outcome') {
      const transactions = await listTransactionsService.execute();
      if (transactions.balance.total - value < 0) {
        throw new AppError('Invalid outcome.', 400);
      }
    }

    const category_id = await this.getCategoryID(category);

    const transactionsRepository = getRepository(Transaction);
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });
    transactionsRepository.save(transaction);

    return transaction;
  }

  /**
   * Returns the category ID from the category name. If the category doesn't exists, it'll be created.
   *
   * @param category
   */
  async getCategoryID(category: string): Promise<string> {
    const categoriesRepository = getRepository(Category);

    const categoryFound = await categoriesRepository.findOne({
      where: { title: category },
    });

    let category_id = '';
    if (categoryFound) {
      category_id = categoryFound.id;
    } else {
      const newCategory = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(newCategory);
      category_id = newCategory.id;
    }
    return category_id;
  }
}

export default CreateTransactionService;
