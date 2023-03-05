exports.aliasTopTours = (req, res, next) => {
  console.log('here');
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// exports.checkId = (req, res, next, value) => {
//   const isIdExist = tours.some(t => t.id === value * 1);
//   if (!isIdExist) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid id'
//     });
//   }
//   next();
// }
