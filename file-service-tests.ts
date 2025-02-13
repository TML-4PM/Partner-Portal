import { Request, Response } from 'express';
import { uploadFile, getFile, deleteFile } from '../controllers/fileController';
import { FileModel } from '../models/fileModel';
import { StorageService } from '../services/storageService';

// Mock the models and services
jest.mock('../models/fileModel');
jest.mock('../services/storageService');

describe('File Controller Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      params: {
        partnerId: 'test-partner',
        fileId: 'test-file-id'
      },
      body: {
        name: 'test-file.pdf',
        type: 'application/pdf',
        size: 1024
      }
    };

    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('uploadFile', () => {
    it('should successfully upload a file', async () => {
      // Mock StorageService upload
      const mockStorageUrl = 'https://storage.com/test-file.pdf';
      (StorageService.prototype.uploadFile as jest.Mock).mockResolvedValue(mockStorageUrl);

      // Mock FileModel create
      const mockCreatedFile = {
        id: 'test-file-id',
        partnerId: 'test-partner',
        name: 'test-file.pdf',
        url: mockStorageUrl
      };
      (FileModel.create as jest.Mock).mockResolvedValue(mockCreatedFile);

      await uploadFile(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'File uploaded successfully',
        file: mockCreatedFile
      });
    });

    it('should handle upload errors', async () => {
      const error = new Error('Upload failed');
      (StorageService.prototype.uploadFile as jest.Mock).mockRejectedValue(error);

      await uploadFile(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getFile', () => {
    it('should return a file if it exists', async () => {
      const mockFile = {
        id: 'test-file-id',
        partnerId: 'test-partner',
        name: 'test-file.pdf'
      };
      (FileModel.findOne as jest.Mock).mockResolvedValue(mockFile);

      await getFile(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        file: mockFile
      });
    });

    it('should return 404 if file does not exist', async () => {
      (FileModel.findOne as jest.Mock).mockResolvedValue(null);

      await getFile(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'File not found'
        })
      );
    });
  });

  describe('deleteFile', () => {
    it('should successfully delete a file', async () => {
      const mockFile = {
        id: 'test-file-id',
        partnerId: 'test-partner',
        remove: jest.fn().mockResolvedValue(undefined)
      };
      (FileModel.findOne as jest.Mock).mockResolvedValue(mockFile);
      (StorageService.prototype.deleteFile as jest.Mock).mockResolvedValue(undefined);

      await deleteFile(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(StorageService.prototype.deleteFile).toHaveBeenCalled();
      expect(mockFile.remove).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'File deleted successfully'
      });
    });

    it('should handle file not found', async () => {
      (FileModel.findOne as jest.Mock).mockResolvedValue(null);

      await deleteFile(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'File not found'
        })
      );
    });
  });
});