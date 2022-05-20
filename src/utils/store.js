export default class Store {
	constructor(size, initialSize) {
		this.items = new Array(initialSize || 0)
		this.size = size
		this._id = 0
		this._rm = []
	}

	static from(iterable, size) {
		const store = new Store(size, iterable.length)
		store.items = iterable
		store._id = iterable.length - 1
		return store
	}

	_getIndex() {
		if (this._rm.length > 0) {
			return this._rm.shift()
		} else if (this._id <= this.items.length) {
			return this._id++
		} else {
			return -1
		}
	}

	get(index) {
		return this.items[index]
	}

	add(item) {
		const index = this._getIndex()

		if (index > -1) {
			this.items[index] = item
		}

		return index
	}

	remove(item) {
		this.removeIndex(this.items.findIndex(item))
	}

	removeIndex(index) {
		if (index >= 0 || index < this.size) {
			this.items[index] = null
			this._rm.push(index)
		}
	}
}
