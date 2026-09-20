function addFlash(req, type, message) {
	if (!req.session.flash) {
		req.session.flash = [];
	}

	req.session.flash.push({ type, message });
}

module.exports = { addFlash };
