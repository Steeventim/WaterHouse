import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunicationLog } from './communication-log.entity';
import { Parser as Json2csvParser } from 'json2csv';

@Injectable()
export class CommunicationLogsService {
  constructor(
    @InjectRepository(CommunicationLog)
    private readonly logRepo: Repository<CommunicationLog>,
  ) {}

  async findAll(params: {
    type?: string;
    status?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.logRepo.createQueryBuilder('log');
    if (params.type) qb.andWhere('log.type = :type', { type: params.type });
    if (params.status) qb.andWhere('log.status = :status', { status: params.status });
    if (params.userId) qb.andWhere('log.recipientId = :userId', { userId: params.userId });
    if (params.startDate) qb.andWhere('log.createdAt >= :startDate', { startDate: params.startDate });
    if (params.endDate) qb.andWhere('log.createdAt <= :endDate', { endDate: params.endDate });
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    qb.skip((page - 1) * limit).take(limit).orderBy('log.createdAt', 'DESC');
    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    return this.logRepo.findOne({ where: { id } });
  }

  async export(params: { format: string; type?: string; status?: string; userId?: string; startDate?: string; endDate?: string }) {
    const qb = this.logRepo.createQueryBuilder('log');
    if (params.type) qb.andWhere('log.type = :type', { type: params.type });
    if (params.status) qb.andWhere('log.status = :status', { status: params.status });
    if (params.userId) qb.andWhere('log.recipientId = :userId', { userId: params.userId });
    if (params.startDate) qb.andWhere('log.createdAt >= :startDate', { startDate: params.startDate });
    if (params.endDate) qb.andWhere('log.createdAt <= :endDate', { endDate: params.endDate });
    const logs = await qb.orderBy('log.createdAt', 'DESC').getMany();
    if (params.format === 'csv') {
      const fields = ['id', 'type', 'provider', 'recipientId', 'recipientContact', 'subject', 'content', 'status', 'providerMessageId', 'errorMessage', 'retryCount', 'sentAt', 'deliveredAt', 'failedAt', 'cost', 'createdAt'];
      const parser = new Json2csvParser({ fields });
      const csv = parser.parse(Array.isArray(logs) ? logs : [logs]);
      return { csv };
    }
    // JSON export (toujours tableau)
    return Array.isArray(logs) ? logs : [logs];
  }
}
