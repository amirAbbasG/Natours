class ApiFeatures {
  constructor(query, queryStrings, itemCount) {
    this.query = query;
    this.queryStrings = queryStrings;
    this.itemCount = itemCount;
  }

  filter() {
    const queryObj = { ...this.queryStrings };
    const excludedFields = ['sort', 'page', 'limit', 'fields'];
    excludedFields.forEach(f => delete queryObj[f]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|g|lt|lte)\b/g, match => `$${match}`);

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryStrings.sort) {
      const sortBy = this.queryStrings.sort.replace(/,/g, ' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  select() {
    if (this.queryStrings.fields) {
      const selectFields = this.queryStrings.fields.replace(/,/g, ' ');
      this.query = this.query.select(selectFields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    const { page = 1, limit = 10 } = this.queryStrings;
    const skipItems = limit * (page - 1);
    this.query = this.query.skip(skipItems).limit(limit);
    this.pageCount = Math.ceil(this.itemCount / limit);

    return this;
  }
}

module.exports = ApiFeatures;
