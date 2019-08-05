'use strict';
const leap_year = (year) => ((!(year % 4) && !!(year % 100)) || !(year % 400)) ? 366 : 365;
module.exports = (milliseconds) => {
	if (typeof milliseconds !== 'number') {
		throw new TypeError('Expected a number');
	}
	
	const ms_date = new Date(milliseconds);
	const ms_year = ms_date.getFullYear();
	const days_in_month = new Date(ms_year, ms_date.getMonth()+1, 0).getDate();
	const weeks_in_month = days_in_month / 7;
	const days_in_year = leap_year(ms_year);
	milliseconds = Date.now() - milliseconds;

	const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;
	return {
      		years: roundTowardsZero(milliseconds / (1000 * 60 * 60 * 24 * days_in_year)), // 31557600000 // 31540000000 // 31536000000
		months: roundTowardsZero(milliseconds / (1000 * 60 * 60 * 24 * days_in_month)) % 12,//) % 12, //2419200000 // 2628000000
		weeks: roundTowardsZero(milliseconds / (1000 * 60 * 60 * 24 * 7)) % Math.ceil(weeks_in_month),
		days: roundTowardsZero(milliseconds / (1000 * 60 * 60 * 24)-1) % 7,
		hours: roundTowardsZero(milliseconds / (1000 * 60 * 60)+1) % 24,
		minutes: roundTowardsZero(milliseconds / (1000 * 60)) % 60,
		seconds: roundTowardsZero(milliseconds / 1000) % 60,
		milliseconds: roundTowardsZero(milliseconds) % 1000,
		microseconds: roundTowardsZero(milliseconds * 1000) % 1000,
		nanoseconds: roundTowardsZero(milliseconds * 1e+6) % 1000
	};
};
