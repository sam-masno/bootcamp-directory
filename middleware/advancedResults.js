const advancedResults = (model, populate) => async (req, res, next) => {
  //handle queries and filtering
  let query;
  // console.log(`${req.original}${req.url}`)
  // console.log(req.params)
  //copy req.query and declare array of reserved fields
  let reqQuery = { ...req.query };
  const remove = ['select', 'sort', 'page', 'limit'];

  // remove reserved fields from req.query before searching
  remove.forEach(param => delete reqQuery[param]);

  // convert req.query to string to manipulate
  let queryStr = JSON.stringify(reqQuery);

  // replace url operators with mongoose operators
  //put in url in brackets after desired field: averageCost[lte]=...
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|all)\b/g, match => `$${match}`);

  // converty querystr back to json and pass as search param, assign to query
  query = model.find(JSON.parse(queryStr));

  //processing for reserved fields
  //parse selects and modify query to return only those fields
  if(req.query.select) {
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields);
    // console.log(fields);
  }

  //accept sort parameter if passed in
  if (req.query.sort){
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  //add populate if passed in
  if (populate) {
    query = query.populate(populate)
  }

  //make pagination and limit
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 5;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(query);
  const last = Math.ceil(total / limit)
  query.skip(startIndex).limit(limit);

  // return query as models
  const results = await query;

  const pagination = {};

  pagination.queryStr = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  pagination.limit = limit;
  pagination.page = page;
  pagination.last = last;
  pagination.total = total;
  // pagination.total = total;
  pagination.count = results.length;

  if(endIndex + limit < total) {
    pagination.twoForward = page + 2
  }
  if(endIndex < total ) {
    pagination.next = page + 1;
  }
  if(page > 1) {
    pagination.previous = page - 1;
  }
  if(page >= 3) {
    pagination.twoPrevious = page - 2;
  }


  res.advancedResults = {
    success: true,
    pagination,
    data: results
  }

  next()
}

module.exports = advancedResults;
