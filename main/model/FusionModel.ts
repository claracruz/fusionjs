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
    private _keys: Array<any>;

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
    private _stateful: Object;

    /**
     * @descritpion
     */
    private path: string = '';

    /**
     * @constructor
     */
    constructor(data: Object) {
        this._stateful = {};
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
        return this;
    }

    /**
     * @description Return the dataset that composes the model as a pure JS object
     */
    toObject () {
        let buffer = {};
        this._keys.forEach((key) => {
            buffer[key] = this.get(key);
        }, this);
        this._hasManyKeys.forEach((key) => {
            buffer[key] = this[key]().toObject();
        }, this);
        this._hasOneKeys.forEach((key) => {
            buffer[key] = this[key]().toObject();
        }, this);
        return buffer;
    }

    /**
     * @param {string} key
     * @description When a key is supplied, the matching value is returned. If no key is supplied
     * then the whole data set is returned, but not relational data
     */
    get (key?: string) {
        if (typeof key !== 'undefined' && key !== null) {
            return this._stateful[key];
        } else {
            return this._getAll();
        }
    }

    /**
     * @private
     */
    _getAll () {
        let buffer = {};
        if (this._keys.length > 0) {
            this._keys.forEach((key) => {
                buffer[key] = this.get(key);
            }, this);
        } else {
            buffer = this._stateful;
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
            if (this._keys.indexOf(keyOrData) > -1)  {
                this._setData(keyOrData, value);
            }
        } else {
            Object.keys(keyOrData).forEach((key) => {
                if (this._keys.indexOf(key) > -1)  {
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
                    isEqual = this[key]().equals(record[key]());
                    return !isEqual;
                });
            } 

            if (this.hasOne) {
                this._hasOneKeys.some((key) => {
                    isEqual = this[key]().equals(record[key]());
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
        let keys = this._keys,
            hasManyKeys = this._hasManyKeys,
            hasOneKeys = this._hasOneKeys;

        keys.forEach((key) => {
            this._stateful[key] = null;
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
        this._stateful[field] = value;
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
        this._keys = [];
        if (fields.length === 0) {
            throw new Error('No fields defined');
        }
        fields.forEach((field) => {
            this._keys.push(field.name);
        }, this);
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