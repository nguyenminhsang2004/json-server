const jsonServer = require('json-server')
const queryString = require('query-string')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)

server.get('/echo', (req, res) => {
  res.jsonp(req.query)
})

server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now()
    req.body.updatedAt = Date.now()
  } else if (req.method === 'PATCH') {
    req.body.updatedAt = Date.now()
  }
  next()
})

router.render = (req, res) => {
  const headers = res.getHeaders();
  const totalCountHeader = headers['x-total-count'];
  if (req.method === 'GET') {
    const result = {
      data: res.locals.data,
    };
    if(totalCountHeader){
      const queryParams = queryString.parse(req._parsedUrl.query);
      result.pagination = {
        _page: Number.parseInt(queryParams._page) || 1,
        _limit: Number.parseInt(queryParams._limit) || Number.parseInt(totalCountHeader),
        _totalRows: Number.parseInt(totalCountHeader),
      };
    }else {
      result.pagination = {
        _page: 1,
        _limit: 1,
        _totalRows: 1,
      };
    }
    return res.jsonp(result);
  }

  return res.jsonp(res.locals.data);
};

server.use('/api', router)
server.listen(process.env.PORT ||3000, () => {
  console.log('JSON Server is running')
})