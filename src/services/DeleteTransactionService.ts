// import AppError from '../errors/AppError';

import { getRepository } from 'typeorm';
import { isUuid } from 'uuidv4';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    if (id && isUuid(id)) {
      const transaction = await transactionsRepository.findOne({
        where: { id },
      });
      if (transaction) {
        await transactionsRepository.delete(id);
      } else {
        throw new AppError('Transaction not found', 404);
      }
    } else {
      throw new AppError('Invalid ID!', 400);
    }
  }
}

export default DeleteTransactionService;
