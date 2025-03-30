// Only allow access to the server if the request comes from one of the following domains
const allowedOrigins = [
  "https://evergreen-budgeting-app.web.app"
];

// Only give localhost access if we're in dev
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push("http://localhost:4200");
}

// Only give localhost port 3000 access if we're testing
if (process.env.NODE_ENV === 'test') {
  allowedOrigins.push("http://localhost:3000");
}

const allowCors = (fn) => async (req, res) => {
  const origin = req.headers.origin || '';

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.status(401).json({ message: 'Unauthorised: Invalid Origin' });
    return;
  }

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tells the browser that the server is okay with receiving a request from the specified origin
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Waits for the actual handler, e.g. getBudget, to complete
  return await fn(req, res);
};

module.exports = allowCors;