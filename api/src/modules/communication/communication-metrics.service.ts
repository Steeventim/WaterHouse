import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunicationMetric } from './communication-metrics.entity';

@Injectable()
export class CommunicationMetricsService {
  constructor(
    @InjectRepository(CommunicationMetric)
    private readonly metricRepo: Repository<CommunicationMetric>,
  ) {}

  async findAll(params: { period?: string; type?: string }) {
    const qb = this.metricRepo.createQueryBuilder('metric');
    if (params.type) qb.andWhere('metric.type = :type', { type: params.type });
    // Pour la démo, ignore le filtrage par période (à implémenter selon besoin)
    qb.orderBy('metric.date', 'DESC');
    return qb.getMany();
  }
}
