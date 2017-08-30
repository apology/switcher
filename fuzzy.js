/**
 * Fuzzy matches a string, returning a score; 0 if no match
 */
const fuzzy = (string, query, debug) => {
	let score = 0;
	let prev = '';
	let pointer = 0;
	let last = null;
	let streak = 0;

	for (let i = 0; i < string.length; i++) {
		if (string[i] === query[pointer]) {
			// Base match score
			score += 1;

			// Multipliers
			if (i - 1 === last) {
				streak++;
				score += (1 << streak);
			}
			if (!prev.match(/[a-zA-Z0-9]/)) score += 1;

			// Incrementers
			pointer++;
			last = i;

			if (debug) console.log('match', i, string[i], prev, last, streak, score);

			// Termination condition
			if (pointer === query.length) return score;
		} else {
			streak = 0;
		}

		prev = string[i];
	}

	return 0;
};
