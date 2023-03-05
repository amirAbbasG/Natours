const { model, Schema } = require('mongoose');
const slugify = require('slugify');

const locationSchema = new Schema({
  type: {
    type: String,
    default: 'Point',
    enum: ['Point']
  },
  coordinates: [Number],
  address: String,
  description: String,
  day: Number
});

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'tour name is is required'],
      unique: [true, 'name is exist'],
      trim: true,
      maxlength: [40, 'tour name must be less than 40 charecters'],
      minlength: [10, 'tour name must be more than 10 charecters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'tour durations is is required']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'tour maxGroupSize is is required']
    },
    difficulty: {
      type: String,
      required: [true, 'tour dificulty is is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    price: {
      type: Number,
      required: [true, 'tour price is is required']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4,
      min: [1.0, 'toure ratingsAverage must be above 1.5'],
      max: [5.0, 'toure ratingsAverage must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    summary: {
      type: String,
      required: [true, 'tour summary is is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'tour image is is required']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: locationSchema,
    locations: [locationSchema],
    guides: [
      {
        type: Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// virtual properties
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// document middleware
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// query middleware
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } }).populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

// tourSchema.post(/^find/, function(docs, next) {
//   console.log(docs);
//   next();
// });

// aggregation middleware
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = model('Tour', tourSchema);

module.exports = Tour;
