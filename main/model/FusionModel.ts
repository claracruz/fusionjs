import {Field} from './Field';
import {FusionStore} from '../store/FusionStore';

interface IModel {
    idProperty: string;
    fields: { name: string, type: string }[];
    hasMany: { name: string, model: any }[];	
    hasOne: { name: string, model: any }[];
}

/**
 * @module
 * @description Provides a representation/description of data structures and the methods to access 
 * and manipulate them
 */
export class FusionModel implements IModel {  

    /**
     * @type {string}
     * @description The default id property, can be overridden for custom identifiers.
     */
    idProperty: string;

    /**
     * @type {Array}
     * @description An Array of field definition for the model
     */
    fields: { name: string, type: string }[];

    /**
     * @type {Array}
     * @description A one to many mapping for associated data fields
     */
    hasMany: { name: string, model: any }[];

    /**
     * @type {Array}
     * @description A one to one mapping for associated data fields
     */
    hasOne: { name: string, model: any }[];

    /**
     * @type {Object}
     * @description The dataset to apply to the model
     */	
    data: Object;

    /**
     * @private
     */
    private _keys: Object;

    /**
     * @private
     */
    private _hasManyKeys: Array<any>;

    /**
     * @private
     */
    private _hasOneKeys: Array<any>;

    /**
     * @private
     */
    private _associatedStores: Object;

    /**
     * @private
     */
    private _isInitialised: boolean = false;

    /**
     * @descritpion
     */
    private path: string = '';

    /**
     * @constructor
     */
    constructor(data: Object) {
        this._associatedStores = {};
        this.data = data;
    }

    /**
     * @description Initialises model
     */
    init () {
        this._setFields();
        this._setUpHasManyRelationship();
        this._setUpHasOneRelationship();

        if (this.data) {
            this.set(this.data);
        }

        this._isInitialised = true;
        return this;
    }

    /**
     * @description Set model data
     */
    setData (data) {
        if (data) {
            this.set(data);
            this.data = data;
        }
    }

    /**
     * @description Return the dataset that composes the model as a pure JS object
     */
    toObject () {
        let buffer = {};
        Object.keys(this._keys).forEach((key) => {
            buffer[key] = this._keys[key].get(key);
        });
        this._hasManyKeys.forEach((key) => {
            buffer[key] = this[key]().toObject();
        });
        this._hasOneKeys.forEach((key) => {
            buffer[key] = this[key]().toObject();
        });
        return buffer;
    }

    /**
     * @description Performs a deep search of record using provided key/value pair
     * Returns matching records
     */
	query (keyValue) {
        console.warn('query method is experimental and not yet fully supported, and is likely to change!');
		let key = Object.keys(keyValue)[0],
            item = this.get(key),
            records = [];

        if (item === keyValue[key]) {
            records.push(this);
        }

        this._hasManyKeys.forEach((key) => {
            let store = this[key](),
                foundRecords = records.concat(store.query(keyValue));
            if (foundRecords && foundRecords.length > 0) {
                records = records.concat(store.query(keyValue));
            }          
        }, this);

        this._hasOneKeys.forEach((key) => {
            let model = this[key]();
            records = records.concat(model.query(keyValue));
        }, this);

        return records;
	}

    /**
     * @param {string} key
     * @description When a key is supplied, the matching value is returned. If no key is supplied
     * then the whole data set is returned, but not relational data
     */
    get (key?: string) {
        if (typeof key !== 'undefined' && key !== null) {
            return this._keys[key].get();
        } else {
            return this._getAll();
        }
    }

    /**
     * @private
     */
    _getAll () {
        let buffer = {},
            keys = Object.keys(this._keys);
        if (keys.length > 0) {
            keys.forEach((key) => {
                buffer[key] = this.get(key);
            }, this);
        }
        return buffer;
    }

    /**
     * @param {(string|Object)} keyOrData Either a key or a hash of data.
     * @param {string} value An optional value. If this is not passed then it is assumed
     * that keyOrData contains a hash of data to set on the model. Otherwise a key / value pair
     * is assumed.
     */
    set (keyOrData: any, value?: any) {
        if (value || keyOrData instanceof String) {
            if (this._keys.hasOwnProperty(keyOrData)) {
                this._setData(keyOrData, value);
            }
        } else {
            Object.keys(keyOrData).forEach((key) => {
                if (this._keys.hasOwnProperty(key)) {
                    this._setData(key, keyOrData[key]);
                } else if (this._hasOneKeys.indexOf(key) > -1 && keyOrData[key]) {
                    this._setAssociatedModelData(keyOrData, key);
                } else if (this._hasManyKeys.indexOf(key) > -1 && keyOrData[key]) {
                    this._setAssociatedStoreData(keyOrData, key);
                }
            });
        }
        return this;
    }

    /**
     * @description Sets path to record
     */
    _setPath (path) {
        this.path += path;
    }

    /**
     * @description Compares its data with data in provided record
     */
	equals (record) {
         return this._isEqual(record);
	}

    /**
     * @description Compares its data with data in provided record
     */
	deepEquals (record) {
         return this._isEqual(record, true);
	}

    /**
     * @description Compares its data and the record with provided record and compared data
     */
    strictEqual (record) {
        let isEqual = this === record;
        return (isEqual) ? this._isEqual(record, true) : isEqual;
    }

    /**
     * @private
     */
    private _isEqual (record, deepEqual?:boolean) {
        let isEqual = true,
            data, recordData;

        data = this.get();
        recordData = record.get();
        Object.keys(data).some((key) => {
            isEqual = data[key] === recordData[key];
            return !isEqual;
        });  

        if (deepEqual) {
            if (this.hasMany) {
                this._hasManyKeys.some((key) => {
                    isEqual = this[key]()._isEqual(record[key](), deepEqual);
                    return !isEqual;
                });
            } 

            if (this.hasOne) {
                this._hasOneKeys.some((key) => {
                    isEqual = this[key]()._isEqual(record[key](), deepEqual);
                    return !isEqual;
                });
            }
        }

        return isEqual;
    }

    /**
     * @description Clears all model data
     */
    reset () {
        let keys = Object.keys(this._keys),
            hasManyKeys = this._hasManyKeys,
            hasOneKeys = this._hasOneKeys;

        keys.forEach((key) => {
            this._keys[key].set(null);
        }, this);

        hasManyKeys.forEach((hasManyKey) => {
            let store =  this[hasManyKey] && this[hasManyKey]();
            if (store) {
                store.reset();
            }
        }, this);

        hasOneKeys.forEach((hasOneKey) => {
            let store = this[hasOneKey] && this[hasOneKey]();
            if (store) {
                store.reset();
            }
        }, this);
    }  

    /**
     * @description Returns the provided record instance in the model
     */
	find (record) {
		let foundRecord = record.path.split('/').reduce((currentRecord, currentPath) => {
			let pathItems = currentPath.split('$');
			currentRecord = currentRecord || this;
			if (pathItems.length === 1) {
				return currentRecord[currentPath] && currentRecord[currentPath]() || currentRecord;
			}
			return pathItems.reduce((accumulator, pathNameOrIndex) => {
				if (accumulator && pathNameOrIndex) {
					return currentRecord[accumulator]().get()[pathNameOrIndex];
				} else {
					return accumulator[pathNameOrIndex]();
				}
			});
		});
        return (foundRecord.path === record.path) ? foundRecord : null;
	}

    /**
     * @private
     */
    _setData (field: string, value: any){
        this._keys[field].set(value);
    }

    /**
     * @private
     */
    _setAssociatedModelData (data, key) {
        let associated = { 
            name: key,
            model: null,
            data: null
        };
        this.hasOne.some(function (item) {
            if (item.name === key) {
                associated.name = item.name;
                associated.model = item.model;
                associated.data = data[key];
                return false;
            }
        }, this);
        if (typeof this[associated.name] === 'function') {
            this[associated.name]().set(associated.data);
        } else {
            this._createAssociatedModel(associated);
        }
    }

    /**
     * @private
     */
    _createAssociatedModel (item) {
        this[item.name] = function () {
            if (typeof this._associatedStores[item.name] === 'undefined') {
                this._associatedStores[item.name] = new item.model({
                    data: item.data,
                    path: this.path + '/' + item.name
                });
                this._associatedStores[item.name]._setPath(this.path + '/' + item.name);
            }
            return this._associatedStores[item.name];
        };
    }

    /**
     * @private
     */
    _setAssociatedStoreData (data, key) {
        let associated = { 
            name: key,
            model: null,
            data: null
        };
        this.hasMany.some(function (item) {
            if (item.name === key) {
                associated.name = item.name;
                associated.model = item.model;
                associated.data = data[key];
                return true;
            }
        }, this);
        if (typeof this[associated.name] === 'function') {
            this[associated.name]().set(associated.data);
        } else {
            this._createAssociatedStore(associated);
        }
    }

    /**
     * @private
     */
    _createAssociatedStore (item) {
        this[item.name] = () => {
            if (typeof this._associatedStores[item.name] === 'undefined') {
                this._associatedStores[item.name] = new FusionStore({
                    model: item.model,
                    data: item.data,
                    path: this.path + '/' + item.name
                });
            }
            return this._associatedStores[item.name];
        };
    }

    /**
     * @private
     */
    _setFields() {
        let fields = this.fields || [];
        if (fields.length === 0) {
            throw new Error('No fields defined');
        }
        this._keys = fields.reduce((acc, field) => {
            acc[field.name] = new Field(field);
            return acc;
        }, {});
    }

    /**
     * @private
     */
    _setUpHasManyRelationship() {
        let hasMany = this.hasMany;
        this._hasManyKeys = [];

        if (typeof hasMany !== 'undefined' && hasMany !== null) {
            this.hasMany = hasMany;
            hasMany.forEach((associate) => {
                this._hasManyKeys.push(associate.name);
                this._createAssociatedStore(associate);
            }, this);
        }   
    }

    /**
     * @private
     */
    _setUpHasOneRelationship() {
        let hasOne = this.hasOne;
        this._hasOneKeys = [];

        if (typeof hasOne !== 'undefined' && hasOne !== null) {
            this.hasOne = hasOne;
            hasOne.forEach((associate) => {
                this._hasOneKeys.push(associate.name);
                this._createAssociatedModel(associate);
            }, this);
        }
    }
}