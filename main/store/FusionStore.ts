/**
 * @interface
 * @description Interface for classes that represent a FusionStore.
 */
interface IStore {
    model: any; /* type should be "FusionModel", "any"" used to circumvent error TS2359/TS2351 when creating model
    instances when dataset passed to store instance is not a collection of model instances */
    data: Object;
    path?: string;
}

/**
 * @class
 * @implements {IStore}
 * @description The store is designed to store data as a collection of fusion model instances.
 */
export class FusionStore implements IStore {

    /**
     * @type {FusionModel}
     * @description The model class associated with this store
     */ 
    model: any;

    /**
     * @type {Object}
     * @description The dataset to apply to the store
     */	
    data: Object;

     /**
     * @type {string}
     * @description The name of the store if store has no parents or the parent path to store including its name when
     * store is created as a FusionModel associate
     */	
    path?: string = '';

    /**
     * @private
     */
    private _records: any;

    /**
     * @private
     */
    private _recordsIndex: any;

    /**
     * @constructor
     */
    constructor (args: IStore) {
        if (typeof args.model === 'undefined') {
            throw new Error('Model property is required');
        }

        this._records = [];
        this.model = args.model;

        if (args.path) {
            this.path = args.path;
        }

        if (args.data) {
            this.set(args.data);
        }
    }

    /**
     * @description Returns the dataset that composes the model as a pure JS object
     */
    toObject () {
        let buffer = [];
        this._records.forEach((record) => {
            buffer.push(record.toObject());
        });
        return buffer;
    }

    /**
     * @param {Object|Array|FusionModel} data
     * @description If an object or array of objects provided, creates a model instance record based on data,
     * if an instance of a model provided, adds model instance to collection
     */
    set (data: any) {
        this._recordsIndex = this._recordsIndex || {};

        if (data instanceof Array) {
            data.forEach((item) => {
                this._setRecord(item);
            }, this);
        } else {
            this._setRecord(data);
        }
    }

    /**
     * @description Set store data
     */
    setData (data) {
        this.reset();
        this.set(data);
    }

    /**
     * @description Returns relevant record (model instance) if id parameter provided or all records (model instances) 
     * in the collection if id parameter not provided.
     */
    get (id?:any) {
        return this._getRecords(id);
    }

     /**
     * @private
     */
    _setRecord (record: any) {
        let recordId, storedRecordIndex,
            model = this.model,
            data;

        if (!(record instanceof model)) {
            data = (<any>Object).assign({}, record);
            record = new model().init();
        } else {
            data = record.get();
        }

        recordId = data[record.idProperty];
        recordId = (recordId) ? recordId : this._records.length + 1;
        storedRecordIndex = this._recordsIndex[recordId];

        if (typeof storedRecordIndex === 'undefined') {
            storedRecordIndex = this._records.push(record) - 1;
            this._recordsIndex[recordId] = storedRecordIndex;
            record._setPath(this.path + '$' + storedRecordIndex);
        }
        this._records[storedRecordIndex].set(data);
    }

     /**
     * @private
     */
    _getRecords (id) {
        if (id) {
            return this._records &&
                this._recordsIndex && this._records[this._recordsIndex[id]] || null;
        }
        return this._records;
    }

    /**
     * @description Clears all store data
     */
    reset () {
        this._records = [];
        this._recordsIndex = null;
    }

    /**
     * @description Queries all the records in store by provided key/value pair
     * Returns matching records
     */
	query (keyValue) {
        console.warn('query method is experimental and not yet fully supported, and is likely to change!');
		let records = [],
            storeData = this.get();

        storeData.forEach((record) => {
            let recordValue = record.query(keyValue);
            records = records.concat(recordValue);
        });

        return records;
	}

    /**
     * @description Compares its collection values with collection in provided store
     */
	equals (store) {
		return this._isEqual(store);
	}

    /**
     * @description Checks that provided store matches instance and compares its collection with 
     * collection in provided store
     */
    strictEquals (store) {
        let isEqual = this === store;
        return isEqual || this._isEqual(store);
    }

    /**
     * @private
     */
    private _isEqual (store) {
        let collection = this.get(),
            providedStoreCollection = store.get(),
            isEqual = collection.length === providedStoreCollection.length;
           
        if (isEqual) {
            collection.some((record, idx) => {
                let providedStoreRecord = providedStoreCollection[idx];
                isEqual = record.equals(providedStoreRecord);
                return !isEqual;
            });
        }

		return isEqual;
    }
}