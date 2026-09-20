module.exports = function viewLocals(req, res, next) {
	res.locals.user = req.session.user || null;
	res.locals.flash = req.session.flash || [];
	delete req.session.flash;
	next();
};
