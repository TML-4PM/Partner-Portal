import { Request, Response, NextFunction } from 'express';
import { FileModel } from '../models/fileModel';
import { StorageService } from '../services/storageService';
import { ServiceError } from '../../../../shared/utils/communication';
import { File, FileSearchParams } from '../../../../shared/types/files';

const storage = new StorageService();

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { partnerId } = req.params;
    const fileData = req.body;
    
    // Upload to storage
    const storageUrl = await storage.uploadFile(partnerId, fileData);
    
    // Create database record
    const file = await FileModel.create({
      ...fileData,
      partnerId,
      url: storageUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file
    });
  } catch (error) {
    next(error);
  }
};

export const getFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { partnerId, fileId } = req.params;
    
    const file = await FileModel.findOne({ _id: fileId, partnerId });
    if (!file) {
      throw new ServiceError(404, 'File not found');
    }

    res.json({
      success: true,
      file
    });
  } catch (error) {
    next(error);
  }
};

export const updateFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { partnerId, fileId } = req.params;
    const updates = req.body;

    const file = await FileModel.findOneAndUpdate(
      { _id: fileId, partnerId },
      { 
        ...updates,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!file) {
      throw new ServiceError(404, 'File not found');
    }

    res.json({
      success: true,
      message: 'File updated successfully',
      file
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { partnerId, fileId } = req.params;

    const file = await FileModel.findOne({ _id: fileId, partnerId });
    if (!file) {
      throw new ServiceError(404, 'File not found');
    }

    // Delete from storage
    await storage.deleteFile(partnerId, fileId);
    
    // Delete database record
    await file.remove();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const listFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { partnerId } = req.params;
    const searchParams: FileSearchParams = req.query;

    const query: any = { partnerId };

    if (searchParams.type) {
      query.type = searchParams.type;
    }

    if (searchParams.tags) {
      query['metadata.tags'] = { $all: searchParams.tags };
    }

    if (searchParams.startDate || searchParams.endDate) {
      query.createdAt = {};
      if (searchParams.startDate) {
        query.createdAt.$gte = new Date(searchParams.startDate);
      }
      if (searchParams.endDate) {
        query.createdAt.$lte = new Date(searchParams.endDate);
      }
    }

    const files = await FileModel.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      files
    });
  } catch (error) {
    next(error);
  }
};