import { Request, Response, NextFunction } from 'express';
import { InsightAnalyzer } from '../analyzers/insightAnalyzer';
import { InsightRepository } from '../repositories/insightRepository';
import { ServiceError } from '../../../../shared/utils/communication';
import { InsightFilter, InsightUpdate } from '../../../../shared/types/insights';

const analyzer = new InsightAnalyzer();
const repository = new InsightRepository();

export const getInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { partnerId } = req.params;
    const filter: InsightFilter = req.query;

    const insights = await repository.findInsights(partnerId, filter);

    res.json({
      success: true,
      insights
    });
  } catch (error) {
    next(error);
  }
};

export const getInsightById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { partnerId, insightId } = req.params;

    const insight = await repository.findInsightById(partnerId, insightId);
    if (!insight) {
      throw new ServiceError(404, 'Insight not found');
    }

    res.json({
      success: true,
      insight
    });
  } catch (error) {
    next(error);
  }
};

export const generateInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { partnerId } = req.params;
    const { timeRange } = req.body;

    // Trigger async insight generation
    analyzer.generateInsights(partnerId, timeRange);

    res.status(202).json({
      success: true,
      message: 'Insight generation started'
    });
  } catch (error) {
    next(error);
  }
};

export const updateInsightStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { partnerId, insightId } = req.params;
    const update: InsightUpdate = req.body;

    const insight = await repository.updateInsight(partnerId, insightId, update);
    if (!insight) {
      throw new ServiceError(404, 'Insight not found');
    }

    res.json({
      success: true,
      message: 'Insight updated successfully',
      insight
    });
  } catch (error) {
    next(error);
  }
};

export const getInsightMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { partnerId } = req.params;
    
    const metrics = await analyzer.getInsightMetrics(partnerId);

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    next(error);
  }
};