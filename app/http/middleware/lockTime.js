const moment = require('moment');

// Lock middleware function
module.exports = function (req, res, next) {
    // Define the locked time range
    const {time,timeOne,timeTwo} = req.query;
    const lockedStartTime = "08:00:00" // Locked start time
    const lockedEndTime ="09:00:00"; // Locked end time
    // Check if the current time is within the locked range
    if (timeOne==lockedStartTime && timeTwo==lockedEndTime) {
        // Return an error response or redirect the user
        return res.status(403).send( 'Access denied. Locked period.');
    }

    // Continue to the next middleware or route handler
    next();
}

