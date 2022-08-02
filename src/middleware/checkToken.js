module.exports = function (req, res, next) {
  const { token } = req.body;
  if (token !== process.env.TOKEN) {
    res.status(403).send({
      reason: 'Invalid token',
    });

    return;
  }

  next();
};
