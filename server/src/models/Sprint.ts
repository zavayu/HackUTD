import mongoose, { Document, Schema } from 'mongoose';

export interface ISprint extends Document {
  projectId: mongoose.Types.ObjectId;
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const SprintSchema = new Schema<ISprint>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Sprint name is required'],
    trim: true,
    maxlength: [100, 'Sprint name cannot exceed 100 characters']
  },
  goal: {
    type: String,
    required: [true, 'Sprint goal is required'],
    trim: true,
    maxlength: [500, 'Sprint goal cannot exceed 500 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: {
      values: ['planned', 'active', 'completed'],
      message: 'Status must be planned, active, or completed'
    },
    default: 'planned'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries by project and status
SprintSchema.index({ projectId: 1, status: 1 });

// Custom validation to ensure endDate is after startDate
SprintSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

// Validation for updates
SprintSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  
  // Check if both dates are being updated
  if (update.startDate && update.endDate) {
    if (new Date(update.endDate) <= new Date(update.startDate)) {
      return next(new Error('End date must be after start date'));
    }
  }
  
  // Check if only endDate is being updated
  if (update.endDate && !update.startDate) {
    // We need to get the current document to compare with existing startDate
    this.model.findOne(this.getQuery()).then((doc: any) => {
      if (doc && new Date(update.endDate) <= doc.startDate) {
        return next(new Error('End date must be after start date'));
      }
      next();
    }).catch((error: Error) => {
      next(error);
    });
    return;
  }
  
  // Check if only startDate is being updated
  if (update.startDate && !update.endDate) {
    // We need to get the current document to compare with existing endDate
    this.model.findOne(this.getQuery()).then((doc: any) => {
      if (doc && doc.endDate <= new Date(update.startDate)) {
        return next(new Error('End date must be after start date'));
      }
      next();
    }).catch((error: Error) => {
      next(error);
    });
    return;
  }
  
  next();
});

// Also handle $set updates
SprintSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  
  if (update.$set) {
    const startDate = update.$set.startDate;
    const endDate = update.$set.endDate;
    
    if (startDate && endDate) {
      if (new Date(endDate) <= new Date(startDate)) {
        return next(new Error('End date must be after start date'));
      }
    }
    
    if (endDate && !startDate) {
      this.model.findOne(this.getQuery()).then((doc: any) => {
        if (doc && new Date(endDate) <= doc.startDate) {
          return next(new Error('End date must be after start date'));
        }
        next();
      }).catch((error: Error) => {
        next(error);
      });
      return;
    }
    
    if (startDate && !endDate) {
      this.model.findOne(this.getQuery()).then((doc: any) => {
        if (doc && doc.endDate <= new Date(startDate)) {
          return next(new Error('End date must be after start date'));
        }
        next();
      }).catch((error: Error) => {
        next(error);
      });
      return;
    }
  }
  
  next();
});

export const Sprint = mongoose.model<ISprint>('Sprint', SprintSchema);