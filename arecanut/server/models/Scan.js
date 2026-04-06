const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    annotatedImage: {
      type: String, // URL path to the annotated image
    },
    gradeA: {
      type: Number,
      default: 0,
    },
    gradeB: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    finalGrade: {
      type: String,
      enum: ['Grade A', 'Grade B', 'Invalid'],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true } // auto adds createdAt and updatedAt
);

module.exports = mongoose.model('Scan', scanSchema);
