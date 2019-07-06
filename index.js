'use strict';
/**
 * Helpers.
 */
const pluralize = (word, count) => count === 1 ? word : word + 's';
const now = new Date();
const ms = 1;
const s = ms * 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const mth = d * new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
const y = d * 366; // 365.25;

module.exports = class Duration {
	static humanized(milliseconds, options = {}) {
		if (typeof milliseconds === 'string') milliseconds = this.getMilliseconds(milliseconds);
		if (!Number.isFinite(milliseconds)) throw new TypeError('Expected a finite number');
		if (options.compact) {
			options.secondsDecimalDigits = 0;
			options.millisecondsDecimalDigits = 0;
		}
		const result = [];

		const add = (value, long, short, valueString) => {
			if (value === 0) return;
			const postfix = options.verbose ? ' ' + pluralize(long, value) : short;
			result.push((valueString || value) + postfix);
		};

		const secondsDecimalDigits =
			typeof options.secondsDecimalDigits === 'number' ?
				options.secondsDecimalDigits :
				1;

		if (secondsDecimalDigits < 1) {
			const difference = 1000 - (milliseconds % 1000);
			if (difference < 500) milliseconds += difference;
		}

		const parsed = this._parseMilliseconds(milliseconds);

		add(Math.trunc(parsed.days / 365), 'year', 'y');
		add(parsed.days % 365, 'day', 'd');
		add(parsed.hours, 'hour', 'h');
		add(parsed.minutes, 'minute', 'm');

		if (
			options.separateMilliseconds ||
			options.formatSubMilliseconds ||
			milliseconds < 1000
		) {
			add(parsed.seconds, 'second', 's');
			if (options.formatSubMilliseconds) {
				add(parsed.milliseconds, 'millisecond', 'ms');
				add(parsed.microseconds, 'microsecond', 'µs');
				add(parsed.nanoseconds, 'nanosecond', 'ns');
			} else {
				const millisecondsAndBelow =
					parsed.milliseconds +
					(parsed.microseconds / 1000) +
					(parsed.nanoseconds / 1e6);

				const millisecondsDecimalDigits =
					typeof options.millisecondsDecimalDigits === 'number' ?
						options.millisecondsDecimalDigits :
						0;

				const millisecondsString = millisecondsDecimalDigits ?
					millisecondsAndBelow.toFixed(millisecondsDecimalDigits) :
					Math.ceil(millisecondsAndBelow);

				add(
					parseFloat(millisecondsString, 10),
					'millisecond',
					'ms',
					millisecondsString
				);
			}
		} else {
			const seconds = (milliseconds / 1000) % 60;
			const secondsDecimalDigits =
				typeof options.secondsDecimalDigits === 'number' ?
					options.secondsDecimalDigits :
					1;
			const secondsFixed = seconds.toFixed(secondsDecimalDigits);
			const secondsString = options.keepDecimalsOnWholeSeconds ?
				secondsFixed :
				secondsFixed.replace(/\.0+$/, '');
			add(parseFloat(secondsString, 10), 'second', 's', secondsString);
		}
		if (!result.length) return '0' + (options.verbose ? ' milliseconds' : 'ms');
		if (options.compact) return '~' + result[0];
		if (typeof options.unitCount === 'number') return '~' + result.slice(0, Math.max(options.unitCount, 1)).join(' ');
		return result.join(' ');
	}

	static _parseMilliseconds(milliseconds) {
		if (typeof milliseconds !== 'number') throw new TypeError('Expected a number');
		const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;
		return {
			days: roundTowardsZero(milliseconds / 86400000),
			hours: roundTowardsZero(milliseconds / 3600000) % 24,
			minutes: roundTowardsZero(milliseconds / 60000) % 60,
			seconds: roundTowardsZero(milliseconds / 1000) % 60,
			milliseconds: roundTowardsZero(milliseconds) % 1000,
			microseconds: roundTowardsZero(milliseconds * 1000) % 1000,
			nanoseconds: roundTowardsZero(milliseconds * 1e6) % 1000
		};
	}

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	static getMilliseconds(val, options = {}) {
		const type = typeof val;
		if (type === 'string' && val.length > 0) return this._parse(val);
		else if (type === 'number' && isFinite(val)) return options.long ? this._fmtLong(val) : this._fmtShort(val);
		throw new Error(
			'val is not a non-empty string or a valid number. val=' +
			JSON.stringify(val)
		);
	}

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	static _parse(str) {
		str = String(str);
		if (str.length > 100) return;
		const regex = /(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?/gi;
		const match = str.match(regex);
		if (!match) return;
		const parse_match = match.map((_, _, p) => regex.exec(p));
		const parse_arrays = parse_match.map((array) => array.splice(1));
		parse_arrays.map((v, x, y) => y[x][0] = parseInt(v));
		let n = 0;
		parse_arrays.forEach((value) => {
			const type = (value[1] || 'ms').toLowerCase();
			if (['years', 'year', 'yrs', 'yr', 'y'].includes(type)) n += value[0] * y;
			if (['months', 'month', 'mths', 'mth'].includes(type)) n += value[0] * mth;
			if (['weeks', 'week', 'w'].includes(type)) n += value[0] * w;
			if (['days', 'day', 'd'].includes(type)) n += value[0] * d;
			if (['hours', 'hour', 'hrs', 'hr', 'h'].includes(type)) n += value[0] * h;
			if (['minutes', 'minute', 'mins', 'min', 'm'].includes(type)) n += value[0] * m;
			if (['seconds', 'second', 'secs', 'sec', 's'].includes(type)) n += value[0] * s;
			if (['milliseconds', 'millisecond', 'msecs', 'msec', 'ms'].includes(type)) n += value[0] * ms;
		});
		return n;
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	static _fmtShort(ms) {
		let msAbs = Math.abs(ms);
		if (msAbs >= d) return Math.round(ms / d) + 'd';
		if (msAbs >= h) return Math.round(ms / h) + 'h';
		if (msAbs >= m) return Math.round(ms / m) + 'm';
		if (msAbs >= s) return Math.round(ms / s) + 's';
		return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	static _fmtLong(ms) {
		const msAbs = Math.abs(ms);
		if (msAbs >= d) return this._plural(ms, msAbs, d, 'day');
		if (msAbs >= h) return this._plural(ms, msAbs, h, 'hour');
		if (msAbs >= m) return this._plural(ms, msAbs, m, 'minute');
		if (msAbs >= s) return this._plural(ms, msAbs, s, 'second');
		return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	static _plural(ms, msAbs, n, name) {
		const isPlural = msAbs >= n * 1.5;
		return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}
}
