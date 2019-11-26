const advancedResults = (model, populate) => async (req, res, next) => {
  //handle queries and filtering
  let query;
  // console.log(req.params)
  //copy req.query and declare array of reserved fields
  let reqQuery = { ...req.query };
  const remove = ['select', 'sort', 'page', 'limit'];

  // remove reserved fields from req.query before searching
  remove.forEach(param => delete reqQuery[param]);

  // convert req.query to string to manipulate
  let queryStr = JSON.stringify(reqQuery);

  // replace url operators with mongoose operators
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // converty querystr back to json and pass as search param, assign to query
  query = model.find(JSON.parse(queryStr));

  //processing for reserved fields
  //parse selects and modify query to return only those fields
  if(req.query.select) {
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields);
    console.log(fields);
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
  const limit = parseInt(req.query.limit, 10) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  // skip to selected page
  query.skip(startIndex).limit(limit);

  // return query as models
  const results = await query;

  const pagination = {};

  if(endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }
  if(startIndex > 0) {
    pagination.previous = {
      page: page -1,
      limit
    }
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  }

  next()
}

module.exports = advancedResults;
