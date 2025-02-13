import mongoose, { Schema, Document } from 'mongoose';
import { File } from '../../../../shared/types/files';

export interface IFileDocument extends File, Document {}

const FileSchema = new Schema({
  partnerId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  metadata: {
    contentType: String,
    lastModified: Date,
    dimensions: {
      width: Number,
      height: Number
    },
    tags: [String]
  },
  permissions: {
    public: {
      type: Boolean,
      default: false
    },
    allowedUsers: [String],
    allowedRoles: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
FileSchema.index({ partnerId: 1, createdAt: -1 });
FileSchema.index({ partnerId: 1, 'metadata.tags': 1 });
FileSchema.index({ partnerId: 1, type: 1 });

// Methods
FileSchema.methods.isAccessibleBy = function(userId: string, userRoles: string[]): boolean {
  if (this.permissions.public) return true;
  
  if (this.permissions.allowedUsers?.includes(userId)) return true;
  
  if (this.permissions.allowedRoles?.some(role => userRoles.includes(role))) return true;
  
  return false;
};

export const FileModel = mongoose.model<IFileDocument>('File', FileSchema);