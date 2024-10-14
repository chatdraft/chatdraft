/**
 * Shuffles the given array
 *
 * @export
 * @template Type
 * @param {Type[]} array Array to shuffle
 * @returns {Type[]} Shuffled array
 */
export function shuffle<Type>(array: Type[]): Type[] {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex > 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

export function compareArrays<Type>(array1: Type[], array2: Type[]): boolean {
	return (
		array1.length === array2.length && array1.every((element, index) => element === array2[index])
	);
}
